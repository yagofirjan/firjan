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
        return this.ModalCustom("O preenchimento do Nome do Solicitante não foi preenchido.");
        
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
      else if (BtnAssinatura == "" || BtnAssinatura == "\n                      ")
      {
        return this.ModalCustom("O preenchimento do campo Assinatura é obrigatório.");
      }

      return true;

  }

  public async ValidationGrid(inputNomeBeneficiario: String, inputCPFBeneficiario: String, inputDataNascimentoBeneficiario: String, inputTelefoneBaneficiario: String,
    inputParentescoBeneficiario: String, inputPorcentagem: String ){
      
      if(inputNomeBeneficiario == "") 
      {
        return this.ModalCustom("O preenchimento do Campo Nome Beneficiário é obrigatório.");
      } else if(inputCPFBeneficiario == "")
      {
        return this.ModalCustom("O preenchimento do Campo CPF do Beneficiário é obrigatório.");
      }
      else if(inputDataNascimentoBeneficiario == "")
      {
        return this.ModalCustom("O preenchimento do Campo Data de Nascimento do Beneficiário é obrigatório.");
      }
      else if(inputTelefoneBaneficiario == "")
      {
        return this.ModalCustom("O preenchimento do Campo Telefone do Beneficiário é obrigatório.");
      }
      else if(inputParentescoBeneficiario == "")
      {
        return this.ModalCustom("O preenchimento do Campo Parentesco é obrigatório.");
      }
      else if (inputPorcentagem == "")
      {
        return this.ModalCustom("O preenchimento do Campo Porcentagem é obrigatório.");
      }

      return true;

  }

  public async ValidationCamposFormatados(inputNomeBeneficiario: String, inputCPFBeneficiario: String, inputDataNascimentoBeneficiario: String ){
      
    var data = this.ValidaData(inputDataNascimentoBeneficiario);
    var cpf = this.ValidaCPF(inputCPFBeneficiario);

       if(cpf != true)
      {
        return this.ModalCustom("O campo CPF referente ao segurado " + inputNomeBeneficiario + " deverá ser preenchido somente com CPF válido.");
      } else if(data != true)
      {
        return this.ModalCustom("O campo Data referente ao segurado " + inputNomeBeneficiario + " deverá ser preenchido com uma data válida.");
      }

      return true;

  }

  public async ValidaPorcentagemTotal(segurados: any ){
      
    var somatotal : number = 0;
    for (var i = 0; i < segurados.length; i++) {
      let valPor = parseInt(segurados[i].porcentagem.split('%')[0]);
      somatotal = somatotal +valPor ;
    }
    if(somatotal > 100 || somatotal < 100  )
            return this.ModalCustom('A soma total das porcentagens não pode ser maior ou menor que 100%.');
    
    return true;

  }

  public async ValidaCPFDuplicado(){

    
    let contador = document.querySelectorAll('.itemGlo');
    let cpfDuplicado = [];

    for (var c = 0; c < contador.length; c++) {
      var id = contador[c].id.split('_')[1]; 
      let inputCPFBeneficiario = (<HTMLInputElement>document.getElementById('inputCPFBenf' + id)).value;
      cpfDuplicado.push(inputCPFBeneficiario);
    }
    
    var valida =   new Set(cpfDuplicado).size !== cpfDuplicado.length;

    if(valida == true)
      return this.ModalCustom('Existem cpfs duplicados na lista de beneficiários. Favor verificar!');
    
    return false;
      
  }

  public async ValidaFile(file: any){
    if (file == undefined || file == null)
    {
      return this.ModalCustom("É necessário anexar o formulário assinado.");
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

  public ValidaData(value : any) {
      //contando chars
      if(value.length!=10) return false;
      // verificando data
      var data        = value;
      var dia         = data.substr(0,2);
      var barra1      = data.substr(2,1);
      var mes         = data.substr(3,2);
      var barra2      = data.substr(5,1);
      var ano         = data.substr(6,4);
      if(data.length!=10||barra1!="/"||barra2!="/"||isNaN(dia)||isNaN(mes)||isNaN(ano)||dia>31||mes>12||dia<1||mes<1)return false;
      if((mes==4||mes==6||mes==9||mes==11) && dia==31)return false;
      if (mes == 2 && (dia > 29 || (dia == 29 && ano % 4 != 0))) return false;
      if (ano < 1900) return false;
      if (ano > 2099) return false;
      return true;
  }

  public ValidaCPF(cpf : any) {
    var isok = true;
    var myCPF;

    myCPF = cpf.replace('.', '').replace('.', '').replace('-', '');
    var numeros, digitos, soma, i, resultado, digitos_iguais;
    digitos_iguais = 1;

    if (myCPF.length < 11) {
        isok = false;
    }
    for (i = 0; i < myCPF.length - 1; i++)
        if (myCPF.charAt(i) != myCPF.charAt(i + 1)) {
            digitos_iguais = 0;
            break;
        }
    if (!digitos_iguais) {
        numeros = myCPF.substring(0, 9);
        digitos = myCPF.substring(9);
        soma = 0;
        for (i = 10; i > 1; i--)
            soma += numeros.charAt(10 - i) * i;
        resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
        if (resultado != digitos.charAt(0)) {
            isok = false;
        }
        numeros = myCPF.substring(0, 10);
        soma = 0;
        for (i = 11; i > 1; i--)
            soma += numeros.charAt(11 - i) * i;
        resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
        if (resultado != digitos.charAt(1)) {
            isok = false;
        }
    }
    else {
        isok = false;
    }
    return isok;
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
