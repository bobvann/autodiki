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
    'Situazioni di necessità',
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
    for(let f of Object.keys(this.userData)){
      if (!this.userData[f]) {
        console.log("invalid: ", f);
        alert('Attenzione! Tutti i campi sono obbligatori');
        return false;
      }
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
      `> di essere a conoscenza delle misure di contenimento del contagio
      di cui al combinato disposto dell'art. 1 del Decreto del Presidente del Consiglio dei
      Ministri 8 marzo 2020 e dell'art. 1, comma 1, del Decreto del Presidente del Consiglio
      dei Ministri del 9 marzo 2020 concernenti lo spostamento delle persone fisiche
      all'interno di tutto il territorio nazionale;`,
      `> di non essere sottoposto alla misura della quarantena e di non essere
      risultato positivo al virus COVID-19 di cui all'articolo 1, comma 1, lettera c),
      del Decreto del Presidente del Consiglio dei Ministri dell' 8 marzo 2020;`,
      `> di essere a conoscenza delle sanzioni previste, dal combinato disposto
      dell'art. 3, comma 4, del D.L. 23 febbraio 2020, n. 6 e dell'art. 4, comma
      2, del Decreto del Presidente del Consiglio dei Ministri dell' 8 marzo 2020
      in caso di inottemperanza delle predette misure di contenimento
      (art. 650 c.p. salvo che il fatto non costituisca piu\` grave reato);`
    ];

    const secondText = secondTexts.map(x => x.replace(/\n/g, '').replace(/ {2}/g, ' ')).join('\n')

    doc.text(10, 15, doc.splitTextToSize(firstText, ROW_WIDTH));

    doc.text(38, 60, 'DICHIARA SOTTO LA PROPRIA RESPONSABILITÀ');

    doc.text(10, 80, doc.splitTextToSize(secondText, ROW_WIDTH));


    doc.text(10, 170, '> Che lo spostamento è determinato da: ');
    let y = 180;

    this.reasons.forEach(r => {
      if (r === this.userData.reason) {
        doc.text(25, y, `(X) ${r}`);
      } else {
        doc.text(25, y, `( )  ${r}` );
      }

      y += 8;
    });

    y += 10;

    const statementText = doc.splitTextToSize(`A questo proposito dichiara che:\n${this.userData.statement}`, 180);

    doc.text(15, y, statementText);


    doc.text(15, 260, 'Data e ora del controllo');
    doc.text(15, 280, 'Firma del dichiarante');
    doc.text(100, 280, 'L\'Operatore di Polizia');

    doc.save('Autodichiarazione.pdf');

  }
}
