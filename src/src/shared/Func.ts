import 'bootstrap';
import Swal from 'sweetalert2';
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

  public async Validation(inputNome: String, inputCPF: String, inputDataNascimento: String, inputMatricula: String,
    inputEmpresa: String, inputEstabelecimento: String, inputLotacao: String, SelectEstado: String, inputDataAss: String, BtnAssinatura: String ){
      
      if(inputNome == "") 
      {
        return this.ModalCustom("O Campo Nome do Solicitante não foi preenchido.");
        
      } else if(inputCPF == "")
      {
        return this.ModalCustom("O preenchimento do CPF do Solicitante é obrigatório.");
      }
      else if(inputDataNascimento == "")
      {
        return this.ModalCustom("O preenchimento Data de Nascimento do Solicitante é obrigatório.");
      }
      else if(inputMatricula == "")
      {
        return this.ModalCustom("O preenchimento da Matricula é obrigatório.");
      }
      else if(inputEmpresa == "")
      {
        return this.ModalCustom("O preenchimento da Empresa é obrigatório.");
      }
      else if (inputEstabelecimento == "")
      {
        return this.ModalCustom("O preenchimento do Estabelecimento é obrigatório");
      }
      else if (inputLotacao == "")
      {
        return this.ModalCustom("O preenchimento da Lotação é obrigatório");
      }
      else if (SelectEstado == "" || SelectEstado == "-")
      {
        return this.ModalCustom("O preenchimento do campo Estado é obrigatório.");
      }
      else if (inputDataAss == "")
      {
        return this.ModalCustom("O preenchimento do campo Data de Assinatura é obrigatório.");
      }
      else if (BtnAssinatura == "")
      {
        return this.ModalCustom("O preenchimento do campo Assinatura é obrigatório.");
      }

      return true;

  }

  public async ValidationGrid(inputNomeBeneficiario: String, inputCPFBeneficiario: String, inputDataNascimentoBeneficiario: String, inputTelefoneBaneficiario: String,
    inputParentescoBeneficiario: String, inputPorcentagem: String ){
      
      if(inputNomeBeneficiario == "") 
      {
        return this.ModalCustom("O Campo Nome Beneficiário não foi preenchido.");
      } else if(inputCPFBeneficiario == "")
      {
        return this.ModalCustom("O Campo CPF do Beneficiário não foi preenchido.");
      }
      else if(inputDataNascimentoBeneficiario == "")
      {
        return this.ModalCustom("O Campo Data de Nascimento do Beneficiário não foi preenchido.");
      }
      else if(inputTelefoneBaneficiario == "")
      {
        return this.ModalCustom("O Campo Telefone do Beneficiário não foi preenchido.");
      }
      else if(inputParentescoBeneficiario == "")
      {
        return this.ModalCustom("O Campo Parentesco não foi preenchido.");
      }
      else if (inputPorcentagem == "")
      {
        return this.ModalCustom("O Campo Porcentagem não foi preenchido.");
      }

      return true;

  }

  public _creatEventTable() {

    let searchInput = (<HTMLInputElement>document.getElementById("myInput"));
    return searchInput.addEventListener('keyup', e => {
      var input, filter, found, table, tr, td, i, j;
      input = document.getElementById("myInput");
      filter = input.value.toUpperCase();
      table = document.getElementById("TableTR");
      tr = table.getElementsByTagName("tr");
      for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td");
        for (j = 0; j < td.length; j++) {
          if (td[j].innerHTML.toUpperCase().indexOf(filter) > -1) {
            found = true;
          }
        }
        if (found) {
          tr[i].style.display = "";
          found = false;
        } else {
          tr[i].style.display = "none";
        }
      }
    });

  }

  public ModalCustom(texto: string) {
      return Swal.fire({
        title: 'Atenção!',
        text: texto,
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: "#DD6B55",
      });
  }

}
