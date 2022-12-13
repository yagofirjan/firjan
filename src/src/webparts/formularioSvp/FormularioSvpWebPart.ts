import { Version } from '@microsoft/sp-core-library';
import { IPropertyPaneConfiguration, PropertyPaneTextField } from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { AadHttpClient, HttpClientResponse, ISPHttpClientOptions } from '@microsoft/sp-http';
import * as strings from 'FormularioSvpWebPartStrings';
import * as $ from 'jquery';
import { ICadSeguradoListItem, ICadBeneficiarioListItem, IAssinaturaDigitalListItem } from '../../models';
import { CadSeguradoService, CadBeneficiarioService, AssinaturaDigitalService } from '../../service';
import { Web } from "sp-pnp-js/lib/pnp";
import { ObterTokenAPIComponent } from '../../shared/ObterTokenAPIRH';
import { ConsultAPIComponent } from '../../shared/ConsultAPI';
import { FormularioComponent } from '../../shared/Formulario';
import { Funcomponent } from '../../shared/Func';
import { TableFormularioComponent } from '../../shared/TableFormulario';
import { ModalComponent } from '../../shared/modal';
import 'bootstrap';
import "@pnp/sp/webs";
import "@pnp/sp/lists/web";
import 'jquery-mask-plugin';
require('../../../node_modules/bootstrap/dist/css/bootstrap.min.css');
require('../../styles/formStyles.css');
require('jquery-mask-plugin');
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';  
import html2canvas from 'html2canvas';  


export interface IFormularioSvpWebPartProps {
  description: string;
}

export default class FormularioSvpWebPart extends BaseClientSideWebPart<IFormularioSvpWebPartProps> {
  public fileInfos = [];
  private ordersClient: AadHttpClient; 
  public segurados = [];
  private ConsultaCadSeguradoService: CadSeguradoService;
  private CadastraCadSeguradoService: CadSeguradoService;
  private ConsultaLastIdService: CadSeguradoService;
  private ConsultaCadBeneficiarioService: CadBeneficiarioService;
  private CadastraCadBeneficiarioService: CadBeneficiarioService;
  private ConsultaAssinaturaService: AssinaturaDigitalService;
  private CadastraAssinaturaDigitalService: AssinaturaDigitalService;
  private obterToken: ObterTokenAPIComponent;
  private consultApi: ConsultAPIComponent;
  private formulario: FormularioComponent;
  private tableFormulario: TableFormularioComponent;
  private modal: ModalComponent;
  private func: Funcomponent;

 
  protected onInit(): Promise<void> {

    this.ConsultaCadSeguradoService = new CadSeguradoService(this.context.pageContext.web.absoluteUrl, this.context.spHttpClient);
    this.CadastraCadSeguradoService = new CadSeguradoService(this.context.pageContext.web.absoluteUrl, this.context.spHttpClient);
    this.ConsultaLastIdService = new CadSeguradoService(this.context.pageContext.web.absoluteUrl, this.context.spHttpClient);
    this.ConsultaCadBeneficiarioService = new CadBeneficiarioService(this.context.pageContext.web.absoluteUrl, this.context.spHttpClient);
    this.CadastraCadBeneficiarioService = new CadBeneficiarioService(this.context.pageContext.web.absoluteUrl, this.context.spHttpClient);
    this.ConsultaAssinaturaService = new AssinaturaDigitalService(this.context.pageContext.web.absoluteUrl, this.context.spHttpClient);
    this.CadastraAssinaturaDigitalService = new AssinaturaDigitalService(this.context.pageContext.web.absoluteUrl, this.context.spHttpClient);
    this.modal = new ModalComponent(this.context.pageContext.web.absoluteUrl, this.context.spHttpClient);
    this.obterToken = new ObterTokenAPIComponent(this.context.pageContext.web.absoluteUrl, this.context.spHttpClient);
    this.consultApi = new ConsultAPIComponent(this.context.pageContext.web.absoluteUrl, this.context.spHttpClient);
    this.formulario = new FormularioComponent(this.context.pageContext.web.absoluteUrl, this.context.spHttpClient);
    this.tableFormulario = new TableFormularioComponent(this.context.pageContext.web.absoluteUrl, this.context.spHttpClient);
    this.func = new Funcomponent(this.context.pageContext.web.absoluteUrl, this.context.spHttpClient);

    return Promise.resolve();
  }
  private HTMLRenderForm: HTMLElement; /*ID RenderForm*/
  private HTMLRenderTable: HTMLElement; /*ID RenderTable*/
  private HTMLTableItens: HTMLElement; /*ID TableTR*/
  private HTMLTableItensAttach: HTMLElement; /*ID HTMLTableItensAttach*/

  public render(): void {
    try {
      const UserName = this.context.pageContext.user.displayName;
      this.ConsultaCadSeguradoService.getCadSegurados(UserName)
        .then((response: ICadSeguradoListItem[]) => {
          if (response && response.length > 0) {

            const htmlTable: string = `<div id="RenderTable"><h1>HTML LISTA DE ITENS<h1></div>`;
            this.domElement.innerHTML = htmlTable;
            this.LoadHtmlTable();

          } else {
            this.Token();
          }
        });
    } catch (Exception) {
      console.error();
    }
  }

//Token
  public async Token() {
    Swal.showLoading();
    var token = await this.obterToken.GetToken();
    var dadosColab = await this.consultApi.ObterDadosColabLogado(token);
    var dependentesAtivos = await this.consultApi.ObterDependentesAtivos(token);

    this.LoadHtmlForm(dadosColab, dependentesAtivos);

  }

//Form
  
  private LoadHtmlForm(Data: any, DataDepend: any) {
    let form = this.formulario.htmlForm(Data,DataDepend);
    this.domElement.innerHTML = form;
    this.LoadCamposForm();
    this.LoadEventForm();
    Swal.close();
  }



  private LoadEventForm() {

    /*BTN DO FORMULARIO */
    let BtnFormulario = (<HTMLButtonElement>document.getElementById('btnSalvar'));
    BtnFormulario.addEventListener('click', (e) => {
      // console.log("botao salvar acionado");
      this.ValidaCampoFile();
      
    });
    /*BOTAO ADICIONA BENEFICIARIO*/
    let newbenf = document.getElementById('BenfSec'); //area
    let addbenf = document.getElementById('addbenf');//btn

    var cont: number = 0;
    let htmlbenf = '';
    addbenf.addEventListener('click', (e) => {
      let qtdbenf = document.querySelectorAll('.itemGlo').length;
      // console.log("testedecontador:  " + qtdbenf);

      if(qtdbenf < 10) { 
        // console.log("contou" + qtdbenf);
        htmlbenf = this.formulario.htmlFormSeguradoAvulso(cont);
        newbenf.insertAdjacentHTML('beforeend', htmlbenf);
        this.LoadCamposForm();

      }else{
        // console.log("barrou" + qtdbenf);
        this.modal.ModalCustomAlert('Somente 10 beneficiários são permitidos.');
      }


    });

    /*BOTAO VOLTAR*/
    let BtnFormularioCancelar = (<HTMLButtonElement>document.getElementById('btnCancelar'));
    BtnFormularioCancelar.addEventListener('click', (e) => {
   
      location.reload();
   
    });

    //Botao Inputfiles
    let SetInputFile = (<HTMLInputElement>document.getElementById('InputFileDocs'));
    SetInputFile.addEventListener('change', (e) => {

      this.blobEdit();
      this._eventAttach();
    });


    //Botao Imprimir
    let BtnFormularioPrint = (<HTMLButtonElement>document.getElementById('btnPrintDoc'));
    BtnFormularioPrint.addEventListener('click', async (e) => {
      await this.ValidaCamposForm() 
      .then(async (validaResultado:any) => {
        if (validaResultado == "Validado") 
        {
          let FormCanvas = this.formulario.htmlFormPrint();
          $(".paperprint").append(FormCanvas);
          $(".paperprint").show();
          $(".paper").hide();

          //pdf formulario 
          const myinput = document.getElementById('paperFormPrint');
            console.log(myinput);
            html2canvas(myinput,{
            foreignObjectRendering:false,
            imageTimeout: 1500,
            removeContainer:true,
            })  
            .then((canvas) => {  

                var imgWidth = 200;  
                var pageHeight = 290;  
                var imgHeight = canvas.height * imgWidth / canvas.width;  
                var heightLeft = imgHeight;  
                const imgData = canvas.toDataURL('image/png');  
                const mynewpdf = new jsPDF( 'p','mm','a4');  
                // const mynewpdf = new jsPDF();  
                  var position = 0;  
                  // mynewpdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);  
                  mynewpdf.addImage(imgData, 'JPEG', 5, position, imgWidth, imgHeight);  
                  // mynewpdf.save("mypdf.pdf");  
                  mynewpdf.save("SegurodeVida.pdf");  
                  $(".paper").show();
                  $(".paperprint").hide();
                  $(".paperprint").empty();
              });



        } 
        else{
          console.log("NãoValidado");
        }

      });

    });

  }

  private LoadCamposForm() {

    //MASCARAS
    $('.CPF').mask('999.999.999-99');
    $('.Date').mask('00/00/0000');
    $('.Telefone').mask('(00) 00000-0000');
    $('.Percent').mask('###%', {
      reverse: true,
      onKeyPress: (val, e, field, options) => {
        if (parseInt(val) > 100) {
          this.modal.ModalCustomAlert('O valor maximo permitido é de 100% !');
          val = '';
        }
      }
    });
    
    //Clica na lixeira
    let button = document.querySelectorAll('.div_divPai_');
    button.forEach(item => {
      item.addEventListener('click', event => {
        let idItem = item.id;
        let CurrentId: number = parseInt(idItem.split('_')[2]);
        var cpf = (<HTMLInputElement>document.getElementById('inputCPFBenf'+CurrentId+'')).value;
        let index = this.segurados.filter(s => s.cpf === cpf);
        if(index.length >0){
        for (var se = 0; se < index.length; se++) {
          this.segurados.splice(this.segurados.indexOf(index[se]), 1);
        }
      }
        document.getElementById('divPai_'+CurrentId+'').remove();
      });
    });

    //Seleciona Outros
    let outros = document.querySelectorAll('.dropdonw');
    outros.forEach(item => {
      item.addEventListener('change', event => {
        var id = item.id;
        var idValue = (<HTMLInputElement>document.getElementById(id)).value;
        var newId = id.split('Benf')[1];
        var elemento_pai = document.getElementById('inputParentescoBenfSelect'+newId+'');
        if(idValue == "Outros"){
          document.getElementById(id).remove();
          var neww = document.createElement('input');
          neww.type = 'text';
          neww.placeholder = 'Informe o Grau.';
          neww.classList.add('form-control-sm');
          neww.classList.add('form-control');
          neww.classList.add('form-control-sm');
          neww.id = id ;
          elemento_pai.appendChild(neww);
        }
      });
    });

  }

  //Table
  private LoadHtmlTable() {
    Swal.showLoading();
    let tableForm = this.tableFormulario.htmlTable();
    this.HTMLRenderTable = document.getElementById('RenderTable');
    this.HTMLRenderTable.innerHTML = tableForm;
    this._setTable();
  }

  private async _setTable() {
    const url = this.context.pageContext.web.absoluteUrl;
    const newURL: string = url.split('/sites')[0];
    const UserName = this.context.pageContext.user.displayName;
    let pendencia: number = 0;
    let HtmlItensTable: string = "";
    await this.ConsultaCadSeguradoService.getCadSegurados(UserName)
      .then(async(response: ICadSeguradoListItem[]) => {

        await response.forEach(async(item: ICadSeguradoListItem) => {
        
          var hist = await this.tableFormulario.htmlTableInit(item, newURL);
          HtmlItensTable += hist;

          var pendencias = this.tableFormulario.verificarPendencias(item);
          pendencia += pendencias;

          let btnSalvaAlteracoes = (<HTMLButtonElement>document.getElementById('NewSolicitacao'));
          btnSalvaAlteracoes.addEventListener('click', () => {
            if (pendencia > 0) {
              this.modal.ModalAvisoFormPendente();

            } else {

              this.Token();
              
            }
          });

          this.HTMLTableItens = document.getElementById('TableTR');
          this.HTMLTableItens.innerHTML = HtmlItensTable;
          Swal.close();
          await this.LoadEventTable();
          await this.func._creatEventTable();
        });
      });

  }

  private async LoadEventTable() {

    let ButtonEdit = document.querySelectorAll('.EditBtn');
   await ButtonEdit.forEach(item => {
      item.addEventListener('click', async event => {
        Swal.showLoading();
        let idItem = item.id;
        let CurrentId: number = parseInt(idItem.split('Btn')[1]);

        await this.ConsultaCadBeneficiarioService.getBeneficiarios(CurrentId)
        .then(async (response: ICadBeneficiarioListItem[]) => {
           this.LoadHtmlModalTable(CurrentId, response);
        });

      });
    });

    //Motivo  
    let BtnOptionsMotivo = document.querySelectorAll('.SPVOptionsMotivo');
    BtnOptionsMotivo.forEach(item => {
      item.addEventListener('click', async event => {
        Swal.showLoading();
        let idItem = item.id;
        let CurrentId: number = parseInt(idItem.split('SPVOptionsMotivo')[1]);

          this.ConsultaCadSeguradoService.getCadSegurado(CurrentId)
            .then(async (Segurado: ICadSeguradoListItem) => {
              Swal.fire(
                'Motivo Rejeição?',
                ''+Segurado.Motivo+'',
                'info'
              );
          });
        });
    });
    
  }

  private LoadHtmlModalTable(ID: number, item: ICadBeneficiarioListItem[]) {
    
    let htmlFormEditSegurado: string = "";
    this.ConsultaCadSeguradoService.getCadSegurado(ID)
    .then((Segurado: ICadSeguradoListItem) => {

      let status = Segurado.Status;

      if (status === "Pendente") {
        htmlFormEditSegurado = this.tableFormulario.htmlTablePopuladoPendente(Segurado, item);
        let btnSalvaAlteracoes = (<HTMLButtonElement>document.getElementById('SalvarAlteracoes'));
        btnSalvaAlteracoes.style.display = "none";

      } 
      else {

        htmlFormEditSegurado = this.tableFormulario.htmlTablePopuladoReprovado(Segurado,item);
        
      }
      let HTMLmodalFormEdit: HTMLElement = document.getElementById('ConteudoModalEdicao');
      HTMLmodalFormEdit.innerHTML = htmlFormEditSegurado;
      Swal.close();
      $('#ModalEdicao').modal();
      
      this.LoadCamposTable(ID);
      
    });
    
  }

  private LoadCamposTable(ID?: number) {
    //MASCARAS
    $('.CPF').mask('999.999.999-99');
    $('.Date').mask('00/00/0000');
    $('.Telefone').mask('(00) 00000-0000');
    $('.Percent').mask('###%', {
      reverse: true,
      onKeyPress: (val, e, field, options) => {
        if (parseInt(val) > 100) {
          this.modal.ModalCustomAlert('O valor maximo permitido é de 100% !');
          val = '';
        }
      }
    });

    var DataArrumada = this.func.FormtDataAssinatura();
    let inputDataAss: HTMLInputElement = <HTMLInputElement>document.getElementById("inputDataAss");
    inputDataAss.value = DataArrumada;


    // Add Func
    let newbenf = document.getElementById('BenfSec'); //area
    let addbenf = (<HTMLButtonElement>document.getElementById('addbenf'));//btn

    var cont: number = 0;
    let htmlbenf = '';
    addbenf.addEventListener('click', (e) => {

      let qtdbenfedit = document.querySelectorAll('.itemGlo').length;

      if(qtdbenfedit < 10) { 
        // console.log("contou" + qtdbenfedit);

        cont = cont + 9090;
        htmlbenf = this.tableFormulario.htmlTableBeneficiariosReprovadoAvulso(cont);
        newbenf.insertAdjacentHTML('beforeend', htmlbenf);
        this.LoadCamposForm();

      }else{
        // console.log("barrou" + qtdbenfedit);
        this.modal.ModalCustomAlert('Somente 10 beneficiários são permitidos.');
      }

    });

    
    //Clica na lixeira
    let button = document.querySelectorAll('.div_divPai_');
    button.forEach(item => {
      item.addEventListener('click', event => {
        let idItem = item.id;
        let CurrentId: number = parseInt(idItem.split('_')[2]);
        var cpf = (<HTMLInputElement>document.getElementById('inputCPFBenf'+CurrentId+'')).value;
        let index = this.segurados.filter(s => s.cpf === cpf);
        if(index.length >0){
        for (var se = 0; se < index.length; se++) {
          this.segurados.splice(this.segurados.indexOf(index[se]), 1);
        }
      }
        document.getElementById('divPai_'+CurrentId+'').remove();
      });
    });

    //Seleciona Outros
    let outros = document.querySelectorAll('.dropdonw');
    outros.forEach(item => {
      item.addEventListener('change', event => {
        var id = item.id;
        var idValue = (<HTMLInputElement>document.getElementById(id)).value;
        var newId = id.split('Benf')[1];
        var elemento_pai = document.getElementById('inputParentescoBenfSelect'+newId+'');
        if(idValue == "Outros"){
          document.getElementById(id).remove();
          var neww = document.createElement('input');
          neww.type = 'text';
          neww.placeholder = 'Informe o Grau.';
          neww.classList.add('form-control-sm');
          neww.classList.add('form-control');
          neww.classList.add('form-control-sm');
          neww.id = id ;
          elemento_pai.appendChild(neww);
        }
      });
    });

    /*INPUT Salvar Alteracao */
    let BtnFormulario = (<HTMLButtonElement>document.getElementById('SalvarAlteracoes'));
    BtnFormulario.addEventListener('click', (e) => {

        this.ValidarSalvar(ID);


      // console.log("testesalvar"+ ID);
      // this.ValidaCamposForm(ID);
      // this.ValidaCampoFile();
      // console.log("botao salvar alterações acionado com o id: "+ ID);

      // this.ValidarSalvar(ID);


    });

    //Botao Inputfiles
    let SetInputFile = (<HTMLInputElement>document.getElementById('InputFileDocs'));
    SetInputFile.addEventListener('change', (e) => {
      this.blobEdit();
      this._eventAttach();

    });

    //Botao Imprimir

    let BtnFormularioPrint = (<HTMLButtonElement>document.getElementById('btnPrintAlteracoes'));
    BtnFormularioPrint.addEventListener('click', async (e) => {
      await this.ValidaCamposForm() 
      .then(async (validaResultado:any) => {
        if (validaResultado == "Validado") {
          let FormCanvas = this.formulario.htmlFormPrint();
          $(".paperprint").append(FormCanvas);
          $(".paperprint").show();
          $(".paper").hide();
          $("#ModalEdicao").hide();
          
          //pdf formulario 
          const myinput = document.getElementById('paperFormPrint');
            console.log(myinput);
            html2canvas(myinput,{
            foreignObjectRendering:false,
            imageTimeout: 1500,
            removeContainer:true,
            })  
            .then((canvas) => {  
              var imgWidth = 200;  
              var pageHeight = 290;  
              var imgHeight = canvas.height * imgWidth / canvas.width;  
              var heightLeft = imgHeight;  
              const imgData = canvas.toDataURL('image/png');  
              const mynewpdf = new jsPDF( 'p','mm','a4');  
              // const mynewpdf = new jsPDF();  
              var position = 0;  
              // mynewpdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);  
              mynewpdf.addImage(imgData, 'JPEG', 5, position, imgWidth, imgHeight);  
              mynewpdf.save("SegurodeVida.pdf");
              $("#ModalEdicao").show();  
              $(".paper").show();
              $(".paperprint").hide();
              $(".paperprint").empty();
            });



          } 
          else{
            console.log("NãoValidado");
          }
    
      });
    
    
    });

    /*INPUT ASSINATURA */
    // let SignatureBtn = (<HTMLButtonElement>document.getElementById('ActionAss'));
    // SignatureBtn.addEventListener('click', (e) => {

    //   this.GetAssinatura();

    // });

    /*BTN MODAL */
    // let BtnCadastrarAssinatura = (<HTMLButtonElement>document.getElementById('BtnCadastrar'));
    // BtnCadastrarAssinatura.addEventListener('click', (e) => {
    //   this.UploadDadosAssinatura();
    
    // });

    /*BOTAO VOLTAR*/
    let BtnFormularioCancelar = (<HTMLButtonElement>document.getElementById('btnCancelar'));
    BtnFormularioCancelar.addEventListener('click', (e) => {

      location.reload();

    });


  }

  //SalvarDados
  private async ValidaCamposForm(ID?: number) {
    
    let validaResultado;
    //SEGURADO
    let files = (<HTMLInputElement>document.getElementById('InputFileDocs')).files;
    // let file = files[0];
    let inputNome = (<HTMLInputElement>document.getElementById('inputName')).value;
    let inputCPF = (<HTMLInputElement>document.getElementById('inputCpf')).value;
    let inputDataNascimento = (<HTMLInputElement>document.getElementById('inputData')).value;
    let inputMatricula = (<HTMLInputElement>document.getElementById('inputMatricula')).value;
    //EMPRESA
    let inputEmpresa = (<HTMLInputElement>document.getElementById('inputEmpresa')).value;
    let inputEstabelecimento = (<HTMLInputElement>document.getElementById('inputEstabelecimento')).value;
    let inputLotacao = (<HTMLInputElement>document.getElementById('inputLotacao')).value;
    //ESTADO DATA ASSINATURA
    let SelectEstado = (<HTMLInputElement>document.getElementById('inputEstado')).value;
    let inputDataAss = "@@";
    let BtnAssinatura = "@@";
    //BENEFICIARIOS
    let contador = document.querySelectorAll('.itemGlo');
    
    var validationCPF = await this.func.ValidaCPFDuplicado();   
    if (validationCPF != false) 
          return console.log("Erro de validação de CPF duplicado.");      

    try {
          var validation = await this.func.Validation(inputNome, inputCPF, inputDataNascimento,
            inputMatricula, inputEmpresa, inputEstabelecimento, inputLotacao, SelectEstado, inputDataAss, BtnAssinatura);

          if (validation != true) 
          return console.log("Erro de validação da grid.");

          let somaP: number = 0;
          for (var i = 0; i < contador.length; i++) {
            var id = contador[i].id.split('_')[1];   
            let inputNomeBeneficiario = (<HTMLInputElement>document.getElementById('inputNomeBenf' + id)).value;
            let inputCPFBeneficiario = (<HTMLInputElement>document.getElementById('inputCPFBenf' + id)).value;
            let inputDataNascimentoBeneficiario = (<HTMLInputElement>document.getElementById('inputDataBenf' + id)).value;
            let inputTelefoneBaneficiario = (<HTMLInputElement>document.getElementById('inputTelefoneBenf' + id)).value;
            let inputParentescoBeneficiario = (<HTMLInputElement>document.getElementById('inputParentescoBenf' + id)).value;
            let inputPorcentagem = (<HTMLInputElement>document.getElementById('inputPorcentagemBenf' + id)).value;

            var validationGrid = await this.func.ValidationGrid(inputNomeBeneficiario, inputCPFBeneficiario, inputDataNascimentoBeneficiario,
               inputTelefoneBaneficiario, inputParentescoBeneficiario, inputPorcentagem);

            if(validationGrid != true)
               return console.log("Erro de validação da grid.");

            var validationCamposFormat = await this.func.ValidationCamposFormatados(inputNomeBeneficiario, inputCPFBeneficiario, inputDataNascimentoBeneficiario);

            if(validationCamposFormat != true)
               return console.log("Erro de validação da grid.");

            let valPor = parseInt(inputPorcentagem.split('%')[0]);
            somaP = somaP + valPor ;
           
              if (valPor > 100) {
                $('.Percent').val('');
                return this.modal.ModalCustomAlert('A porcentagem deve ser de no máximo 100% para o beneficiário '+ inputNomeBeneficiario +' ');
              } 
              if (valPor == 0) {
                $('.Percent').val('');
                return this.modal.ModalCustomAlert('A porcentagem não pode ser 0% para o beneficiário '+ inputNomeBeneficiario +' ');
              } 

              let segurado = {
              "nome": inputNomeBeneficiario,
              "cpf" : inputCPFBeneficiario,
              "dataNascimento": inputDataNascimentoBeneficiario,
              "telefone": inputTelefoneBaneficiario,
              "parentesco":inputParentescoBeneficiario,
              "porcentagem":inputPorcentagem,
              };

            let index = this.segurados.filter(s => s.cpf === inputCPFBeneficiario);
            for (var se = 0; se < index.length; se++) {
              this.segurados.splice(this.segurados.indexOf(index[se]), 1);
            }
            this.segurados.push(segurado);
          }

          var validationPorcentagem = await this.func.ValidaPorcentagemTotal(this.segurados);
        
          if(validationPorcentagem != true)
            return console.log("Erro de validação da porcentagem!");
        
            validaResultado = "Validado";
          return validaResultado ;

          
      // salvar dados       
      //  if (ID == null || ID == 0 || ID === undefined) 
      //   {
      //       this.Gravar();
      //       this.modal.ModalLoad();
      //   } 
      //   else 
      //   {
      //       this.Gravar(ID);
      //       this.modal.ModalLoad();
      //   }



      } 
      catch (error) {

        this.modal.ModalAviso();

      }

  }

  private async ValidaCampoFile(){
    let files = (<HTMLInputElement>document.getElementById('InputFileDocs')).files;
    let file = files[0];

    try {
      var ValidaFile = await this.func.ValidaFile(file);

      if (ValidaFile != true) 
      return console.log("Erro de validação do arquivo.");

      var ValidaCampos = await this.ValidaCamposForm();

      if (ValidaCampos != "Validado") 
      return console.log("Erro ao validar formulário");

      this.Gravar();
      this.modal.ModalLoad();


  } 
  catch (error) {

    this.modal.ModalAviso();

  }
  }

  private async ValidarSalvar(ID?: number) {
    let files = (<HTMLInputElement>document.getElementById('InputFileDocs')).files;
    let file = files[0];

    try {

      var ValidaFile = await this.func.ValidaFile(file);

      if (ValidaFile != true) 
      return console.log("Erro de validação do arquivo.");

      var ValidaCampos = await this.ValidaCamposForm(ID);

      if (ValidaCampos != "Validado") 
      return console.log("Erro ao validar formulário");

      if (ID == null || ID == 0 || ID === undefined) {

        this.Gravar();
        this.modal.ModalLoad();
      } else 
        {
            this.Gravar(ID);
            this.modal.ModalLoad();
        }

    } 
  catch (error) {

    this.modal.ModalAviso();

  }

  }

  
  private async Gravar(ID?: number) {

    //SEGURADO
    let ValueNome = (<HTMLInputElement>document.getElementById('inputName')).value;
    let ValueCPF = (<HTMLInputElement>document.getElementById('inputCpf')).value;
    let ValueDataNascimento = (<HTMLInputElement>document.getElementById('inputData')).value;
    let ValueMatricula = (<HTMLInputElement>document.getElementById('inputMatricula')).value;
    //EMPRESA
    let ValueEmpresa = (<HTMLInputElement>document.getElementById('inputEmpresa')).value;
    let ValueEstabelecimento = (<HTMLInputElement>document.getElementById('inputEstabelecimento')).value;
    let ValueLotacao = (<HTMLInputElement>document.getElementById('inputLotacao')).value;
    //ESTADO DATA ASSINATURA
    let ValueEstado =  (<HTMLInputElement>document.getElementById('inputEstado')).value;
    let ValueDataAss = (<HTMLInputElement>document.getElementById('inputDataAss')).value;
    let ValueAssinatura = "Assinatura realizada por impressão.";
    let login = (<HTMLInputElement>document.querySelector('.divNome')).id.split('_')[1];
    const newCadSegurado: ICadSeguradoListItem = <ICadSeguradoListItem>{
      Nome: ValueNome,
      CPF: ValueCPF,
      DataNascimento: ValueDataNascimento,
      Matricula: ValueMatricula,
      Empresa: ValueEmpresa,
      Estabelecimento: ValueEstabelecimento,
      Lotacao: ValueLotacao,
      Estado: ValueEstado,
      DataAssinatura: ValueDataAss,
      Status: "Pendente",
      Motivo:"",
      Assinatura: ValueAssinatura,
      Login: login,
    };
    

    if (ID == null || ID == 0 || ID === undefined) 
    {
     await this.CadastraCadSeguradoService.CreateCadSegurado(newCadSegurado)
        .then(async() => {
          return await this.BuscaIDSeguradoSalvo();
        });
    } else {
      await this.CadastraCadSeguradoService.UpdateCadSegurado(newCadSegurado, ID)
        .then(async() => {
          await this.UpdateAnexos(this.fileInfos, ID);
          return await this.SalvaDadosBeneficiarios(ID);
        });
    }

  }

  
  private async BuscaIDSeguradoSalvo() {
    const UserName = this.context.pageContext.user.displayName;
    await this.ConsultaCadSeguradoService.getLastBySegurado(UserName)
      .then(async(response: ICadSeguradoListItem) => {
        await this.SalvaAnexos(this.fileInfos, response.ID);
        return await this.SalvaDadosBeneficiarios(response.ID);
      });

  }

  private async SalvaDadosBeneficiarios(SeguradoID: number) {

    await this.ConsultaCadBeneficiarioService.getBeneficiarios(SeguradoID)
          .then(async(response: ICadBeneficiarioListItem[]) => {
            console.log(response);
            if(response.length > 0){
              await response.forEach(async(item: ICadBeneficiarioListItem) => {
                await this.CadastraCadBeneficiarioService.DeleteCadBeneficiario(item.ID);
              });
            }
          });
      
      for (var i = 0; i < this.segurados.length; i++) {
        
        const newCadBeneficiario: ICadBeneficiarioListItem = <ICadBeneficiarioListItem>{

          IDSegurado: SeguradoID,
          Nome: this.segurados[i].nome,
          CPF: this.segurados[i].cpf,
          DataNascimento: this.segurados[i].dataNascimento,
          Telefone: this.segurados[i].telefone,
          Parentesco: this.segurados[i].parentesco,
          Porcentagem: this.segurados[i].porcentagem,
        };
        await this.CadastraCadBeneficiarioService.CreateCadBeneficiario(newCadBeneficiario);
      }

      await this.modal.ModalSucesso();
      let SignatureBtn = (<HTMLButtonElement>document.getElementById('ActionAss'));
      SignatureBtn.innerText = '';
      $("#FormularioSVP").trigger("reset");
      this.render();
  }

  private async SalvaAnexos(fileInfos, id) {

    let web = new Web(this.context.pageContext.web.absoluteUrl);
    var item = web.lists.getByTitle("CadSegurado").items.getById(id);
    await item.attachmentFiles.addMultiple(fileInfos)
      .then((v) => { console.log(v); })
      .catch((err) => { console.log(err); });
  }

  private async UpdateAnexos(fileInfos, id: number) {
    let web = new Web(this.context.pageContext.web.absoluteUrl);
    var item = await web.lists.getByTitle("CadSegurado").items.getById(id);

    let files = (<HTMLInputElement>document.getElementById('InputFileDocs')).files;
    let file = files[0];
    if(file != undefined || file != null){
    
    let attachments = await item.attachmentFiles.get(); 
    let attachmentNames = attachments.map(a => a.FileName);
    for (var att = 0; att < attachmentNames.length; att++) {
      await item.attachmentFiles.deleteMultiple(attachmentNames[att]);
    }
    
    await item.attachmentFiles.addMultiple(fileInfos);
    
    }

  }

  private blobEdit() {
    var input = (<HTMLInputElement>document.getElementById('InputFileDocs'));
    var fileCount = input.files.length;
    this.fileInfos.splice(0, this.fileInfos.length);
    let fileInfos = this.fileInfos;
    fileInfos.splice(0, fileInfos.length);

    let anexos = (<HTMLButtonElement>document.getElementById('anexosDivAuxSVP'));
    if (anexos != null || anexos != undefined) {
      anexos.remove();
    }

    let anexosHtml = document.querySelectorAll('.myli');
    if (anexosHtml != null || anexosHtml != undefined) {
      anexosHtml.forEach(item => {
        item.remove();
      });
    }

    for (var i = 0; i < fileCount; i++) {

      var file = input.files[i];
      var reader = new FileReader();

      reader.onload = ((file) =>{
          return (e) =>{

          fileInfos.push({
            "name": file.name,
            "content": e.target.result,
            "id": [i]
          });

          let children = `${file.name}`;
          var elemento_pai = (<HTMLElement>document.getElementById('fileList'));

          var div = document.createElement('div');
          div.classList.add('myli');
          div.style.marginRight = "5px";
          div.style.paddingRight = "12px";
          var texto = document.createTextNode(children);
          div.appendChild(texto);
          elemento_pai.appendChild(div);
        };
      })(file);

      reader.readAsArrayBuffer(file);
    }

    require('../../styles/formStyles.css');

    this._eventAttach();
  }

  private _eventAttach() {
    let BtnRemoveItem = document.querySelectorAll('.remove-list');
    BtnRemoveItem.forEach(item => {
      item.addEventListener('click', (e) => {
        item.remove();
      });
    });

  }



  //ASSINATURA
  // private async UploadDadosAssinatura() {
  //   let files = (<HTMLInputElement>document.getElementById('formFile')).files;
  //   let file = files[0];
  //   var data = new Date();
  //   var dia = (data.getDate().toString().length === 2) ? data.getDate() : '0' + data.getDate();                 // 1-31
  //   var mes = data.getMonth();                                                                                 // 2 dígitos
  //   var ano = data.getFullYear();                                                                               // 4 dígitos
  //   var hora = (data.getHours().toString().length === 2) ? data.getHours() : '0' + data.getHours();              // 0-23
  //   var min = (data.getMinutes().toString().length === 2) ? data.getMinutes() : '0' + data.getMinutes();        // 0-59
  //   var seg = (data.getSeconds().toString().length === 2) ? data.getSeconds() : '0' + data.getSeconds();        // 0-59
  //   var str_data = (mes + 1).toString().length === 2 ? (mes + 1) : '0' + (mes + 1) + '-' + dia + '-' + ano;
  //   var str_hora = hora + '-' + min + '-' + seg;

  //   if (file != undefined || file != null) {
  //     let spOpts: ISPHttpClientOptions = {
  //       headers: {
  //         "Accept": "application/json",
  //         "Content-Type": "application/json"
  //       },
  //       body: file,
  //     };
  //     let web = new Web(this.context.pageContext.web.absoluteUrl);
  //     {
  //       // large upload
  //       web.getFolderByServerRelativeUrl("/sites/DEV/SignatureData/").files.addChunked(str_data + "_" + str_hora + "_" + file.name, file, run => {
  //         let myNumber: number = parseInt(((run.currentPointer / run.fileSize) * 100).toString());
  //         myNumber.toFixed();
  //       }, true)
  //         .then(result => {

  //           console.log(file.name + " upload successfully!");

  //           let LastId: number;
  //           return this.ConsultaAssinaturaService.getLastAssinatura()
  //             .then((item: IAssinaturaDigitalListItem) => {
  //               LastId = item.ID;
  //               return this.UpdateDadosAssinatura(LastId);
  //             });
  //         });
  //     }
  //   }
  // }
  
  // private UpdateDadosAssinatura(LastId: number) {

  //   var chars = "0123456789" + "ABCDEFGHIJKLMNOPQRSTUVWXYZ" + "abcdefghijklmnopqrstuvwxyz" + "!@#$%&";
  //   var string_length = 16;
  //   var randomstring32 = '';

  //   for (var i = 0; i < string_length; i++) {
  //     var rnum = Math.floor(Math.random() * chars.length);
  //     randomstring32 += chars.substring(rnum, rnum + 1);
  //   }

  //   let web = new Web(this.context.pageContext.web.absoluteUrl);

  //   let item = web.lists.getByTitle("SignatureData").items.getById(LastId);
  //   item.update({

  //     NomeUsuario: this.context.pageContext.user.displayName,
  //     EmailUsuario: this.context.pageContext.user.email,
  //     HashCode: randomstring32,

  //   }).then(r => {

  //     console.log(" properties updated successfully!");
  //     (<HTMLInputElement>document.getElementById('formFile')).value = "";
  //     $('#ModalUploadAssinatura').modal('hide');
  //     this.modal.ModalSucessoAssinatura();

  //   });
  // }

  // private GetAssinatura() {

  //   const UserName = this.context.pageContext.user.displayName;
  //   const UserEmail = this.context.pageContext.user.email;

  //   this.ConsultaAssinaturaService.getAssinaturas(UserName, UserEmail)
  //     .then((Signature: IAssinaturaDigitalListItem[]) => {
  //       if (Signature && Signature.length > 0) {

  //         let ChrHash: string = Signature[0].HashCode;
  //         let NUser: string = Signature[0].NomeUsuario;

  //         this.modal.ModalSignatureTrue(ChrHash, NUser);

  //       } else {

  //         this.ModalSignatureFalse();

  //       }
  //     });
  // }

  // public async ModalSignatureFalse() {

  //   const UserName = this.context.pageContext.user.displayName;
  //   const UserEmail = this.context.pageContext.user.email;

  //   let areaname: HTMLElement = document.getElementById('NameModal');
  //   areaname.innerHTML = UserName;
  //   let areaemail: HTMLElement = document.getElementById('EmailModal');
  //   areaemail.innerHTML = UserEmail;
  //   $('#ModalUploadAssinatura').modal();
  // }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
