import { Injectable, Logger } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import * as crypto from 'crypto';

export interface IncidenciaPdf {
  id: string;
  tipo: string;
  descripcion: string;
  area: string | null;
  prioridad: string;
  informa: string | null;
  origen: string;
  estado: string;
  created_at: string;
  closed_at: string | null;
}

export interface ResidentePdf {
  id: string;
  nombre: string;
  apellidos: string;
  habitacion: string | null;
}

export interface PaiPdf {
  id: string;
  version: number;
  estado: string;
  contenido: Record<string, unknown>;
  aprobado_por: string | null;
  aprobado_en: string | null;
  created_at: string;
}

@Injectable()
export class DocumentosService {
  private readonly logger = new Logger(DocumentosService.name);

  /**
   * Genera un PDF de incidencia con pdfkit.
   * Incluye header institucional, cuerpo con todos los campos y footer con hash de integridad.
   */
  async generarPdfIncidencia(
    incidencia: IncidenciaPdf,
    residente: ResidentePdf,
    centroNombre?: string,
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];

      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 55, bottom: 55, left: 55, right: 55 },
        info: {
          Title: `Incidencia ${incidencia.id}`,
          Author: 'ResidIA',
          Subject: 'Registro de incidencia',
          CreationDate: new Date(),
        },
      });

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err: Error) => reject(err));

      const azul = '#0071E3';
      const gris = '#86868B';
      const negro = '#1D1D1F';
      const separador = '#E5E5EA';

      // ── HEADER ────────────────────────────────────────────────────────────
      doc
        .rect(55, 55, 485, 58)
        .fillColor(azul)
        .fill();

      doc
        .fillColor('#FFFFFF')
        .font('Helvetica-Bold')
        .fontSize(18)
        .text('ResidIA', 70, 68);

      doc
        .font('Helvetica')
        .fontSize(9.5)
        .text(centroNombre ?? 'Residencia', 70, 90);

      doc
        .font('Helvetica')
        .fontSize(9)
        .text(
          `Generado el ${new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}`,
          400,
          76,
          { align: 'right', width: 125 },
        );

      // ── TÍTULO ────────────────────────────────────────────────────────────
      doc
        .fillColor(negro)
        .font('Helvetica-Bold')
        .fontSize(16)
        .text('Registro de Incidencia', 55, 135);

      doc
        .fillColor(gris)
        .font('Helvetica')
        .fontSize(9)
        .text(`ID: ${incidencia.id}`, 55, 156);

      doc
        .moveTo(55, 172)
        .lineTo(540, 172)
        .strokeColor(separador)
        .lineWidth(1)
        .stroke();

      // ── RESIDENTE ─────────────────────────────────────────────────────────
      let y = 184;

      doc
        .fillColor(azul)
        .font('Helvetica-Bold')
        .fontSize(10)
        .text('DATOS DEL RESIDENTE', 55, y);

      y += 18;

      const camposResidente: Array<[string, string]> = [
        ['Nombre', `${residente.nombre} ${residente.apellidos}`],
        ['Habitación', residente.habitacion ?? '—'],
      ];

      for (const [etiqueta, valor] of camposResidente) {
        doc.fillColor(gris).font('Helvetica').fontSize(9).text(etiqueta, 55, y, { width: 110 });
        doc.fillColor(negro).font('Helvetica').fontSize(9).text(valor, 175, y);
        y += 16;
      }

      y += 8;
      doc.moveTo(55, y).lineTo(540, y).strokeColor(separador).lineWidth(0.5).stroke();
      y += 12;

      // ── INCIDENCIA ────────────────────────────────────────────────────────
      doc
        .fillColor(azul)
        .font('Helvetica-Bold')
        .fontSize(10)
        .text('DATOS DE LA INCIDENCIA', 55, y);

      y += 18;

      const prioridadLabel: Record<string, string> = {
        alta: 'Alta',
        media: 'Media',
        baja: 'Baja',
      };

      const estadoLabel: Record<string, string> = {
        abierta: 'Abierta',
        cerrada: 'Cerrada',
        borrador_whatsapp: 'Borrador (WhatsApp)',
      };

      const camposIncidencia: Array<[string, string]> = [
        ['Tipo', incidencia.tipo],
        ['Área', incidencia.area ?? '—'],
        ['Prioridad', prioridadLabel[incidencia.prioridad] ?? incidencia.prioridad],
        ['Informa', incidencia.informa ?? '—'],
        ['Origen', incidencia.origen],
        ['Estado', estadoLabel[incidencia.estado] ?? incidencia.estado],
        ['Fecha registro', new Date(incidencia.created_at).toLocaleString('es-ES')],
        ['Fecha cierre', incidencia.closed_at ? new Date(incidencia.closed_at).toLocaleString('es-ES') : '—'],
      ];

      for (const [etiqueta, valor] of camposIncidencia) {
        doc.fillColor(gris).font('Helvetica').fontSize(9).text(etiqueta, 55, y, { width: 110 });
        doc.fillColor(negro).font('Helvetica').fontSize(9).text(valor, 175, y);
        y += 16;
      }

      y += 8;
      doc.moveTo(55, y).lineTo(540, y).strokeColor(separador).lineWidth(0.5).stroke();
      y += 12;

      // ── DESCRIPCIÓN ───────────────────────────────────────────────────────
      doc
        .fillColor(azul)
        .font('Helvetica-Bold')
        .fontSize(10)
        .text('DESCRIPCIÓN', 55, y);

      y += 16;

      doc
        .fillColor(negro)
        .font('Helvetica')
        .fontSize(9.5)
        .text(incidencia.descripcion, 55, y, { width: 485, lineGap: 4 });

      // ── FOOTER ────────────────────────────────────────────────────────────
      const hashContenido = `${incidencia.id}|${incidencia.created_at}|${incidencia.descripcion}`;
      const hash = crypto
        .createHash('sha256')
        .update(hashContenido, 'utf8')
        .digest('hex')
        .substring(0, 32);

      doc
        .moveTo(55, 770)
        .lineTo(540, 770)
        .strokeColor(separador)
        .lineWidth(0.5)
        .stroke();

      doc
        .fillColor(gris)
        .font('Helvetica')
        .fontSize(7.5)
        .text(
          `Documento generado por ResidIA  ·  Hash de integridad: ${hash}`,
          55,
          778,
          { align: 'center', width: 485 },
        );

      doc.end();
    });
  }

  /**
   * Genera un PDF de PAI (Plan de Atención Individual) con pdfkit.
   */
  async generarPdfPai(
    pai: PaiPdf,
    residente: ResidentePdf,
    centroNombre?: string,
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];

      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 55, bottom: 55, left: 55, right: 55 },
        info: {
          Title: `PAI v${pai.version} — ${residente.nombre} ${residente.apellidos}`,
          Author: 'ResidIA',
          Subject: 'Plan de Atención Individual',
          CreationDate: new Date(),
        },
      });

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err: Error) => reject(err));

      const azul = '#0071E3';
      const gris = '#86868B';
      const negro = '#1D1D1F';
      const separador = '#E5E5EA';

      // ── HEADER ────────────────────────────────────────────────────────────
      doc.rect(55, 55, 485, 58).fillColor(azul).fill();

      doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(18).text('ResidIA', 70, 68);
      doc.font('Helvetica').fontSize(9.5).text(centroNombre ?? 'Residencia', 70, 90);
      doc
        .font('Helvetica')
        .fontSize(9)
        .text(
          `Generado el ${new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}`,
          400, 76,
          { align: 'right', width: 125 },
        );

      // ── TÍTULO ────────────────────────────────────────────────────────────
      doc.fillColor(negro).font('Helvetica-Bold').fontSize(16).text('Plan de Atención Individual (PAI)', 55, 135);

      doc.fillColor(gris).font('Helvetica').fontSize(9).text(
        `Versión ${pai.version}  ·  ID: ${pai.id}  ·  Estado: ${pai.estado}`,
        55, 156,
      );

      doc.moveTo(55, 172).lineTo(540, 172).strokeColor(separador).lineWidth(1).stroke();

      let y = 184;

      // ── RESIDENTE ─────────────────────────────────────────────────────────
      doc.fillColor(azul).font('Helvetica-Bold').fontSize(10).text('RESIDENTE', 55, y);
      y += 18;

      doc.fillColor(gris).font('Helvetica').fontSize(9).text('Nombre', 55, y, { width: 110 });
      doc.fillColor(negro).font('Helvetica').fontSize(9).text(`${residente.nombre} ${residente.apellidos}`, 175, y);
      y += 16;

      doc.fillColor(gris).font('Helvetica').fontSize(9).text('Habitación', 55, y, { width: 110 });
      doc.fillColor(negro).font('Helvetica').fontSize(9).text(residente.habitacion ?? '—', 175, y);
      y += 20;

      doc.moveTo(55, y).lineTo(540, y).strokeColor(separador).lineWidth(0.5).stroke();
      y += 12;

      // ── CONTENIDO DEL PAI ─────────────────────────────────────────────────
      const contenido = pai.contenido;

      if (contenido && typeof contenido === 'object') {
        const areas = (contenido as Record<string, unknown>).areas;
        if (Array.isArray(areas)) {
          doc.fillColor(azul).font('Helvetica-Bold').fontSize(10).text('ÁREAS DE INTERVENCIÓN', 55, y);
          y += 18;

          for (const area of areas as Array<Record<string, unknown>>) {
            if (y > 700) {
              doc.addPage();
              y = 55;
            }

            doc.fillColor(negro).font('Helvetica-Bold').fontSize(10).text(String(area.nombre ?? ''), 55, y);
            y += 14;

            if (area.objetivos) {
              doc.fillColor(gris).font('Helvetica-Bold').fontSize(8.5).text('Objetivos:', 65, y);
              y += 13;
              doc.fillColor(negro).font('Helvetica').fontSize(8.5).text(String(area.objetivos), 75, y, { width: 460, lineGap: 3 });
              y += doc.heightOfString(String(area.objetivos), { width: 460 }) + 6;
            }

            if (area.intervenciones) {
              doc.fillColor(gris).font('Helvetica-Bold').fontSize(8.5).text('Intervenciones:', 65, y);
              y += 13;
              doc.fillColor(negro).font('Helvetica').fontSize(8.5).text(String(area.intervenciones), 75, y, { width: 460, lineGap: 3 });
              y += doc.heightOfString(String(area.intervenciones), { width: 460 }) + 10;
            }

            doc.moveTo(65, y).lineTo(540, y).strokeColor(separador).lineWidth(0.4).stroke();
            y += 10;
          }
        }
      }

      // ── APROBACIÓN ────────────────────────────────────────────────────────
      if (pai.aprobado_por && pai.aprobado_en) {
        if (y > 700) { doc.addPage(); y = 55; }

        y += 10;
        doc.moveTo(55, y).lineTo(540, y).strokeColor(separador).lineWidth(0.5).stroke();
        y += 12;

        doc.fillColor(azul).font('Helvetica-Bold').fontSize(10).text('APROBACIÓN', 55, y);
        y += 18;

        doc.fillColor(gris).font('Helvetica').fontSize(9).text('Aprobado por', 55, y, { width: 110 });
        doc.fillColor(negro).font('Helvetica').fontSize(9).text(pai.aprobado_por, 175, y);
        y += 16;

        doc.fillColor(gris).font('Helvetica').fontSize(9).text('Fecha aprobación', 55, y, { width: 110 });
        doc.fillColor(negro).font('Helvetica').fontSize(9).text(
          new Date(pai.aprobado_en).toLocaleString('es-ES'),
          175, y,
        );
      }

      // ── FOOTER ────────────────────────────────────────────────────────────
      const hashContenido = `${pai.id}|v${pai.version}|${pai.created_at}`;
      const hash = crypto
        .createHash('sha256')
        .update(hashContenido, 'utf8')
        .digest('hex')
        .substring(0, 32);

      doc.moveTo(55, 770).lineTo(540, 770).strokeColor(separador).lineWidth(0.5).stroke();
      doc
        .fillColor(gris)
        .font('Helvetica')
        .fontSize(7.5)
        .text(
          `Documento generado por ResidIA  ·  Versión ${pai.version}  ·  ${new Date().toLocaleDateString('es-ES')}  ·  Hash: ${hash}`,
          55, 778,
          { align: 'center', width: 485 },
        );

      doc.end();
    });
  }
}
