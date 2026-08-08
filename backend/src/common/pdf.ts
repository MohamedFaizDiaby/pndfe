import PDFDocument from 'pdfkit';
import { createWriteStream } from 'fs';
import { join } from 'path';
import { uploadsSubdir } from './file-storage';

export interface ContratPdfData {
  contratId: string;
  typeContrat: string;
  poste: string;
  lieuTravail: string;
  salaireBrut: number;
  dateDebut: Date;
  dateFin: Date | null;
  agence: {
    raisonSociale: string;
    registreCommerce: string;
    telephone: string;
    adresse: string;
  };
  travailleur: {
    nom: string;
    prenoms: string;
    numeroPieceIdentite: string;
    telephone: string;
  };
  signatureNom: string;
  signatureAt: Date;
  numeroCnps: string;
  numeroCmu: string;
}

const dateStr = (d: Date) => d.toLocaleDateString('fr-FR');
const money = (n: number) => `${n.toLocaleString('fr-FR')} FCFA`;

/**
 * Genere le PDF du contrat et le sauvegarde sous uploads/contrats/<id>.pdf.
 * Retourne l'URL publique relative (servie par ServeStaticModule sur /uploads).
 */
export function generateContratPdf(data: ContratPdfData): Promise<string> {
  const dir = uploadsSubdir('contrats');
  const filename = `${data.contratId}.pdf`;
  const filepath = join(dir, filename);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const stream = createWriteStream(filepath);
    doc.pipe(stream);

    doc
      .fontSize(9)
      .fillColor('#6b7280')
      .text("REPUBLIQUE DE COTE D'IVOIRE - MINISTERE DE L'EMPLOI ET DE LA PROTECTION SOCIALE", { align: 'center' })
      .text('PNDFE - Plateforme Numerique de l\'Emploi Formel', { align: 'center' })
      .moveDown(1);

    doc
      .fillColor('#0f2a4a')
      .fontSize(18)
      .text('CONTRAT DE TRAVAIL', { align: 'center' })
      .moveDown(0.3)
      .fontSize(10)
      .fillColor('#6b7280')
      .text(`Reference : ${data.contratId}`, { align: 'center' })
      .moveDown(1.5);

    doc.fillColor('#000000').fontSize(11);

    doc.font('Helvetica-Bold').text("ENTRE LES SOUSSIGNES :");
    doc.font('Helvetica').moveDown(0.3);
    doc.text(`L'employeur : ${data.agence.raisonSociale}`);
    doc.text(`Registre de commerce (RCCM) : ${data.agence.registreCommerce}`);
    doc.text(`Adresse : ${data.agence.adresse}`);
    doc.text(`Telephone : ${data.agence.telephone}`);
    doc.moveDown(0.8);

    doc.font('Helvetica-Bold').text('ET :');
    doc.font('Helvetica').moveDown(0.3);
    doc.text(`Le travailleur : ${data.travailleur.prenoms} ${data.travailleur.nom}`);
    doc.text(`Piece d'identite : ${data.travailleur.numeroPieceIdentite}`);
    doc.text(`Telephone : ${data.travailleur.telephone}`);
    doc.moveDown(1);

    doc.font('Helvetica-Bold').text('IL A ETE CONVENU CE QUI SUIT :');
    doc.font('Helvetica').moveDown(0.3);
    doc.text(`Type de contrat / secteur : ${data.typeContrat}`);
    doc.text(`Poste occupe : ${data.poste}`);
    doc.text(`Lieu de travail : ${data.lieuTravail}`);
    doc.text(`Salaire brut mensuel : ${money(data.salaireBrut)}`);
    doc.text(`Date de debut : ${dateStr(data.dateDebut)}`);
    doc.text(`Date de fin : ${data.dateFin ? dateStr(data.dateFin) : 'Duree indeterminee'}`);
    doc.moveDown(1);

    doc.font('Helvetica-Bold').text('PROTECTION SOCIALE :');
    doc.font('Helvetica').moveDown(0.3);
    doc.text(`Numero d'affiliation CNPS : ${data.numeroCnps}`);
    doc.text(`Numero de couverture CMU : ${data.numeroCmu}`);
    doc.text(
      'Ce contrat entraine la declaration automatique du travailleur aupres de la ' +
        "CNPS et l'enregistrement de sa cotisation CMU, conformement au programme PNDFE.",
      { align: 'justify' },
    );
    doc.moveDown(1.5);

    doc.font('Helvetica-Bold').text('SIGNATURE ELECTRONIQUE DU TRAVAILLEUR');
    doc.font('Helvetica').moveDown(0.3);
    doc.text(`Nom signe : ${data.signatureNom}`);
    doc.text(`Date et heure : ${data.signatureAt.toLocaleString('fr-FR')}`);
    doc
      .fontSize(9)
      .fillColor('#6b7280')
      .text(
        "Signature electronique simple realisee depuis l'application PNDFE (saisie du nom complet " +
          'et acceptation explicite des conditions). Pour une valeur probatoire renforcee en production, ' +
          "la plateforme s'appuie sur un prestataire de signature electronique agree.",
        { align: 'justify' },
      );

    doc.end();

    stream.on('finish', () => resolve(`/uploads/contrats/${filename}`));
    stream.on('error', reject);
  });
}

export interface BulletinPdfData {
  paiementId: string;
  periode: string;
  poste: string;
  agence: { raisonSociale: string; registreCommerce: string };
  travailleur: { nom: string; prenoms: string; numeroPieceIdentite: string };
  salaireBrut: number;
  cotisationCnps: number;
  cotisationCmu: number;
  salaireNet: number;
  methodePaiement: string;
  telephoneBeneficiaire: string;
  referenceTransaction: string;
  datePaiement: Date;
  numeroCnps: string;
  numeroCmu: string;
}

const methodeLabel = (m: string) => (m === 'ORANGE_MONEY' ? 'Orange Money' : 'MTN Mobile Money');

/**
 * Genere le bulletin de paie PDF et le sauvegarde sous uploads/bulletins/<id>.pdf.
 */
export function generateBulletinPdf(data: BulletinPdfData): Promise<string> {
  const dir = uploadsSubdir('bulletins');
  const filename = `${data.paiementId}.pdf`;
  const filepath = join(dir, filename);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const stream = createWriteStream(filepath);
    doc.pipe(stream);

    doc
      .fontSize(9)
      .fillColor('#6b7280')
      .text("REPUBLIQUE DE COTE D'IVOIRE - MINISTERE DE L'EMPLOI ET DE LA PROTECTION SOCIALE", { align: 'center' })
      .text("PNDFE - Plateforme Numerique de l'Emploi Formel", { align: 'center' })
      .moveDown(1);

    doc
      .fillColor('#0f2a4a')
      .fontSize(18)
      .text('BULLETIN DE PAIE', { align: 'center' })
      .moveDown(0.2)
      .fontSize(11)
      .fillColor('#6b7280')
      .text(`Periode : ${data.periode}`, { align: 'center' })
      .moveDown(1.5);

    doc.fillColor('#000000').fontSize(11);

    doc.font('Helvetica-Bold').text('EMPLOYEUR');
    doc.font('Helvetica').moveDown(0.3);
    doc.text(data.agence.raisonSociale);
    doc.text(`RCCM : ${data.agence.registreCommerce}`);
    doc.moveDown(0.8);

    doc.font('Helvetica-Bold').text('SALARIE');
    doc.font('Helvetica').moveDown(0.3);
    doc.text(`${data.travailleur.prenoms} ${data.travailleur.nom}`);
    doc.text(`Piece d'identite : ${data.travailleur.numeroPieceIdentite}`);
    doc.text(`Poste : ${data.poste}`);
    doc.text(`N° affiliation CNPS : ${data.numeroCnps}`);
    doc.text(`N° couverture CMU : ${data.numeroCmu}`);
    doc.moveDown(1);

    doc.font('Helvetica-Bold').text('DETAIL DE LA REMUNERATION');
    doc.font('Helvetica').moveDown(0.4);

    const rows: [string, string][] = [
      ['Salaire brut', money(data.salaireBrut)],
      ['Cotisation CNPS (retraite, part salariale)', `- ${money(data.cotisationCnps)}`],
      ['Cotisation CMU', `- ${money(data.cotisationCmu)}`],
    ];
    for (const [label, value] of rows) {
      doc.text(label, { continued: true });
      doc.text(value, { align: 'right' });
    }
    doc.moveDown(0.3);
    doc.font('Helvetica-Bold');
    doc.text('NET A PAYER', { continued: true });
    doc.text(money(data.salaireNet), { align: 'right' });
    doc.font('Helvetica').moveDown(1);

    doc.font('Helvetica-Bold').text('PAIEMENT');
    doc.font('Helvetica').moveDown(0.3);
    doc.text(`Methode : ${methodeLabel(data.methodePaiement)}`);
    doc.text(`Numero beneficiaire : ${data.telephoneBeneficiaire}`);
    doc.text(`Reference de transaction : ${data.referenceTransaction}`);
    doc.text(`Date de versement : ${data.datePaiement.toLocaleString('fr-FR')}`);
    doc.moveDown(1.5);

    doc
      .fontSize(9)
      .fillColor('#6b7280')
      .text(
        'Document genere automatiquement par la plateforme PNDFE. Paiement Mobile Money simule ' +
          "dans cette version de demonstration (aucun transfert d'argent reel n'a ete effectue). " +
          "En production, le versement s'effectue via l'API du prestataire Mobile Money agree " +
          "(Orange Money / MTN MoMo).",
        { align: 'justify' },
      );

    doc.end();

    stream.on('finish', () => resolve(`/uploads/bulletins/${filename}`));
    stream.on('error', reject);
  });
}
