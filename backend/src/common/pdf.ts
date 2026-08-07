import PDFDocument from 'pdfkit';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

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
  const dir = 'uploads/contrats';
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

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
