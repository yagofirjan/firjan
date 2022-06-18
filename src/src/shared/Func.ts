import 'bootstrap';
import { SPHttpClient } from '@microsoft/sp-http';
require('../../node_modules/bootstrap/dist/css/bootstrap.min.css');

export class Funcomponent {
  constructor(private siteAbsoluteUrl: string, private client: SPHttpClient) { }

  public FormtDataAssinatura() {
    let Ajustemes: string;
    var data = new Date();
    var dia = data.getDate();
    var mes = data.getMonth();
    var ano = data.getFullYear();
    Arrumadata(mes);

    function Arrumadata(idMes: number): void {

      switch (idMes) {
        case 0:
          Ajustemes = "Janeiro";
          break;
        case 1:
          Ajustemes = "Fevereiro";
          break;
        case 2:
          Ajustemes = "Março";
          break;
        case 3:
          Ajustemes = "Abril";
          break;
        case 4:
          Ajustemes = "Maio";
          break;
        case 5:
          Ajustemes = "Junho";
          break;
        case 6:
          Ajustemes = "Julho";
          break;
        case 7:
          Ajustemes = "Agosto";
          break;
        case 8:
          Ajustemes = "Setembro";
          break;
        case 9:
          Ajustemes = "Outubro";
          break;
        case 10:
          Ajustemes = "Novembro";
          break;
        default:
          Ajustemes = "Dezembro";
          break;
      }
    }
    var AssData = dia + ' de ' + Ajustemes + ' de ' + ano;
    return AssData;
  }

}
