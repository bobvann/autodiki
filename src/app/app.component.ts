import {Component, OnInit} from '@angular/core';
import {IMyDpOptions} from 'mydatepicker';
import * as jsPDF from 'jspdf';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  private KEY_STORAGE = 'USER_DATA';

  myDatePickerOptions: IMyDpOptions = {
    dateFormat: 'dd/mm/yyyy',
  };


  docTypes = [
    'Carta d\'Identità',
    'Patente',
    'Passaporto',
    'Altro'
  ];

  reasons = [
    'Comprovate esigenze lavorative',
    `Assoluta urgenza (“per trasferimenti in comune diverso”, come previsto
     dall’art. 1, comma 1, lettera b) del Decreto del Presidente del Consiglio dei
     Ministri 22 marzo 2020)`,
    `Situazione di necessita' (per spostamenti all’interno dello stesso comune,
     come previsto dall’art. 1, comma 1, lett. a) del Decreto del Presidente del
     Consiglio dei Ministri 8 marzo 2020`,
    'Motivi di salute',
    'Rientro presso il proprio domicilio, abitazione o residenza'
  ];

  userData = {
    fullName : '',
    phoneNumber : '',
    birthPlace : '',
    livePlace : '',
    liveAddress : '',
    docType : '',
    docNumber : '',
    reason : '',
    statement : '',
    addressStart : '',
    addressEnd : '',

    birthDate : { date: null, formatted : ''  }
  };

  saveToStorage = true;

  ngOnInit(): void {
    const data = localStorage.getItem(this.KEY_STORAGE);

    if (data) {
      const jsonData = JSON.parse(data);
      Object.assign(this.userData, jsonData);
    }

  }

  validate(): boolean {
    for (const f of Object.keys(this.userData)) {
      if (!this.userData[f]) {
        console.log('invalid: ', f);
        alert('Attenzione! Tutti i campi sono obbligatori');
        return false;
      }
    }

    if (this.reasons.indexOf(this.userData.reason) < 0) {
      alert('Attenzione! Motivazione dello spostamento obbligatoria');
      return false;
    }

    return true;
  }

  generate() {

    const ROW_WIDTH = 190;

    if (!this.validate()) {
      return;
    }

    if (this.saveToStorage) {
      localStorage.setItem(this.KEY_STORAGE, JSON.stringify(this.userData));
    } else {
      localStorage.setItem(this.KEY_STORAGE, null);
    }

    const doc = new jsPDF();

    const firstText = `Il sottoscritto ${this.userData.fullName},
    nato il ${this.userData.birthDate.formatted} a ${this.userData.birthPlace},
    residente in ${this.userData.livePlace}, ${this.userData.liveAddress},
    identificato a mezzo ${this.userData.docType} nr. ${this.userData.docNumber}
    utenza telefonica ${this.userData.phoneNumber}, consapevole delle conseguenze penali
    previste in caso di dichiarazioni mendaci a pubblico ufficiale (art 495 c.p.)`
      .replace(/\n/g, '').replace(/ {2}/g, ' ');


    const secondTexts = [
      `> di essere a conoscenza delle misure di contenimento del contagio previste dall’art. 1 del Decreto del Presidente del Consiglio
      dei Ministri 11 marzo 2020, l’art. 1 del Decreto del Presidente del Consiglio dei Ministri 22 marzo 2020, dall’art. 1 dell’Ordinanza
      del Ministro della salute 20 marzo 2020 concernenti le limitazioni alle possibilita' di spostamento delle persone fisiche all’interno
      di tutto il territorio nazionale;`,
      `> di non essere sottoposto alla misura della quarantena e di non essere risultato positivo al COVID-19 di cui all’articolo 1,
      comma 1, lettera c), del Decreto del Presidente del Consiglio dei Ministri 8 marzo 2020;`,
      `> di essere a conoscenza delle sanzioni previste dal combinato disposto dell’art. 3, comma 4, del decreto legge 23
      febbraio 2020, n. 6 e dell’art. 4, comma 2, del Decreto del Presidente del Consiglio dei Ministri 8 marzo 2020
      in caso di inottemperanza delle predette misure di contenimento (art. 650 c.p. salvo che il fatto non costituisca piu' grave reato);`,
      `> che lo spostamento e' iniziato da ${this.userData.addressStart} con destinazione ${this.userData.addressEnd}`
    ];

    doc.setFontSize(14);

    const secondText = secondTexts.map(x => x.replace(/\n/g, '').replace(/ {2}/g, ' ')).join('\n');

    doc.text(10, 15, doc.splitTextToSize(firstText, ROW_WIDTH));

    doc.text(38, 50, 'DICHIARA SOTTO LA PROPRIA RESPONSABILITÀ');

    doc.text(10, 60, doc.splitTextToSize(secondText, ROW_WIDTH));


    doc.text(10, 155, '> Che lo spostamento è determinato da: ');

    let y = 165;

    this.reasons.forEach(r => {
      if (r === this.userData.reason) {
        doc.text(25, y, `(X) ${r}`);
      } else {
        doc.text(25, y, `( )  ${r}` );
      }

      y += 7 * r.split('\n').length;
    });

    y += 8;

    const statementText = doc.splitTextToSize(`A questo proposito dichiara che:\n${this.userData.statement}`, ROW_WIDTH);

    doc.text(15, y, statementText);


    doc.text(15, 260, 'Data e ora del controllo');
    doc.text(15, 280, 'Firma del dichiarante');
    doc.text(100, 280, 'L\'Operatore di Polizia');

    doc.save('Autodichiarazione.pdf');

  }
}
