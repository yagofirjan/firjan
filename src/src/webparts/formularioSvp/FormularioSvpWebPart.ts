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
import styles from './FormularioSvpWebPart.module.scss';
import 'bootstrap';
import "@pnp/sp/webs";
import "@pnp/sp/lists/web";
import 'jquery-mask-plugin';
require('../../../node_modules/bootstrap/dist/css/bootstrap.min.css');
require('../../styles/formStyles.css');
require('jquery-mask-plugin');

export interface IFormularioSvpWebPartProps {
  description: string;
}

export default class FormularioSvpWebPart extends BaseClientSideWebPart<IFormularioSvpWebPartProps> {
  /*API EXTERNA */
  private ordersClient: AadHttpClient;
  /*API EXTERNA */

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

  public async Token() {
    var token = await this.obterToken.GetToken();
    var dadosColab = await this.consultApi.ObterDadosColabLogado(token);
    var dependentesAtivos = await this.consultApi.ObterDependentesAtivos(token);

    this._SetMyData(dadosColab, dependentesAtivos);

  }

  private _SetMyData(Data: any, Depend: any) {

    this.LoadHtmlForm(Depend);

    let SetNome = (<HTMLInputElement>document.getElementById('inputName'));
    let SetCPF = (<HTMLInputElement>document.getElementById('inputCpf'));
    let SetDataNascimento = (<HTMLInputElement>document.getElementById('inputData'));
    let SetMatricula = (<HTMLInputElement>document.getElementById('inputMatricula'));
    let SetEmpresa = (<HTMLInputElement>document.getElementById('inputEmpresa'));
    let SetEstabelecimento = (<HTMLInputElement>document.getElementById('inputEstabelecimento'));
    let SetLotacao = (<HTMLInputElement>document.getElementById('inputLotacao'));

    SetNome.value = Data.nome;
    SetCPF.value = Data.documentacao.cpf;
    let fD = Data.dataNascimento.split("T")[0].split("-");
    SetDataNascimento.value = fD[2] + "/" + fD[1] + "/" + fD[0];
    SetMatricula.value = Data.matricula;
    SetEmpresa.value = Data.empresa.id + ' - ' + Data.empresa.nome;
    SetEstabelecimento.value = Data.estabelecimento.id + ' - ' + Data.estabelecimento.nome;
    SetLotacao.value = Data.lotacao.id + ' - ' + Data.lotacao.descricao;

    SetNome.disabled = true;
    SetCPF.disabled = true;
    SetDataNascimento.disabled = true;
    SetMatricula.disabled = true;
    SetEmpresa.disabled = true;
    SetEstabelecimento.disabled = true;
    SetLotacao.disabled = true;

  }
  
  private LoadHtmlForm(DataDepend: any) {
    let form = this.formulario.htmlForm(DataDepend);
    this.domElement.innerHTML = form;
    this.LoadEventForm();
    this.LoadCamposForm();
  }

  private LoadEventForm() {

    /*BTN DO FORMULARIO */
    let BtnFormulario = (<HTMLButtonElement>document.getElementById('btnSalvar'));
    BtnFormulario.addEventListener('click', (e) => {

      this.ValidaCamposForm();

    });
    /*INPUT ASSINATURA */
    let SignatureBtn = (<HTMLButtonElement>document.getElementById('ActionAss'));
    SignatureBtn.addEventListener('click', (e) => {

      this.GetAssinatura();

    });
    /*BTN MODAL */
    let BtnCadastrarAssinatura = (<HTMLButtonElement>document.getElementById('BtnCadastrar'));
    BtnCadastrarAssinatura.addEventListener('click', (e) => {
      this.UploadDadosAssinatura();

    });
    /*BOTAO ADICIONA BENEFICIARIO*/
    let newbenf = document.getElementById('BenfSec'); //area
    let addbenf = document.getElementById('addbenf');//btn
    var cont: number = 0;
    let htmlbenf = '';
    addbenf.addEventListener('click', (e) => {
     
      cont = cont + 1;
      htmlbenf = this.formulario.htmlFormSeguradoAvulso(cont);
      newbenf.insertAdjacentHTML('beforeend', htmlbenf);
      this.LoadCamposForm();

    });
  }

  private LoadCamposForm() {
    //MASCARAS
    $('.CPF').mask('999.999.999-99');
    $('.Date').mask('00/00/0000');
    $('.Telefone').mask('(00) 00000-0000');
    $('.Percent').mask('###%', {
      reverse: true,
      onKeyPress: function (val, e, field, options) {
        if (parseInt(val) > 100) {
          console.clear();
          this.modal.ModalCustomAlert('O valor maximo permitido 100% !');
          $('.Percent').val('');
        }
      }
    });

    var DataArrumada = this.func.FormtDataAssinatura();
    let inputDataAss: HTMLInputElement = <HTMLInputElement>document.getElementById("inputDataAss");
    inputDataAss.value = DataArrumada;
  }
  //TABLE
  private LoadHtmlTable() {
    let tableForm = this.tableFormulario.htmlTable();
    this.HTMLRenderTable = document.getElementById('RenderTable');
    this.HTMLRenderTable.innerHTML = tableForm;

    this._setTable();
  }

  private _setTable() {
    const url = this.context.pageContext.web.absoluteUrl;
    const newURL: string = url.split('/sites')[0];
    const UserName = this.context.pageContext.user.displayName;

    let HtmlItensTable: string = "";
    let pendencia: number = 0;

    this.ConsultaCadSeguradoService.getCadSegurados(UserName)
      .then((response: ICadSeguradoListItem[]) => {

        response.forEach((item: ICadSeguradoListItem) => {
          if (item.Status == "Pendente") {
            pendencia += 1;
            HtmlItensTable += `<tr id="VR${item.ID}">
                              <td class="${styles.tbtd}">Formulário de Vale Refeição e Alimentação</td>
                              <td class="${styles.tbtd}">${item.DataAssinatura}</td>
                              <td class="${styles.tbtd}">${item.Status}</td>
                              <td class="${styles.tbtd}"id="TdOptions${item.ID}">
                                  <button type="submit" class="EditBtn" id="EditBtn${item.ID}">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" class="bi bi-search" viewBox="0 0 16 16">
                                    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                                    </svg>
                                  </button>
                                  </td>
                                </tr>`;

          }
          if (item.Status == "Reprovado") {
            pendencia += 1;
            HtmlItensTable += `<tr id="VR${item.ID}">
                              <td class="${styles.tbtd}">Formulário de Vale Refeição e Alimentação</td>
                              <td class="${styles.tbtd}">${item.DataAssinatura}</td>
                              <td class="${styles.tbtd}">${item.Status}</td>
                              <td class="${styles.tbtd}"id="TdOptions${item.ID}">
                                <button type="submit" class="EditBtn" id="EditBtn${item.ID}">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16">
                                  <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                                  <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>
                                </svg>
                                </button>
                              </td>
                            </tr>`;

          }
          if (item.Status == "Aprovado") {
            let arr: any = item.AttachmentFiles;
            let newarrVR = arr[arr.length - 1];

            HtmlItensTable += `<tr id="VR${item.ID}">
                            <td class="${styles.tbtd}">Formulario de Vale Refeicao e Alimentacao</td>
                            <td class="${styles.tbtd}">${item.DataAssinatura}</td>
                            <td class="${styles.tbtd}">${item.Status}</td>
                            <td class="${styles.tbtd}" id="TdOptions">
                            <a href="${newURL}${newarrVR.ServerRelativeUrl}" target="_blank">
                              <button  class="${styles.BtnOptionsPdf} OptionsPdf" title="PDF Solicitação" id="AuxCreOptionsPdf${item.ID}">
                                <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" fill="currentColor" class="bi bi-filetype-pdf" viewBox="0 0 16 16">
                                  <path fill-rule="evenodd" d="M14 4.5V14a2 2 0 0 1-2 2h-1v-1h1a1 1 0 0 0 1-1V4.5h-2A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v9H2V2a2 2 0 0 1 2-2h5.5L14 4.5ZM1.6 11.85H0v3.999h.791v-1.342h.803c.287 0 .531-.057.732-.173.203-.117.358-.275.463-.474a1.42 1.42 0 0 0 .161-.677c0-.25-.053-.476-.158-.677a1.176 1.176 0 0 0-.46-.477c-.2-.12-.443-.179-.732-.179Zm.545 1.333a.795.795 0 0 1-.085.38.574.574 0 0 1-.238.241.794.794 0 0 1-.375.082H.788V12.48h.66c.218 0 .389.06.512.181.123.122.185.296.185.522Zm1.217-1.333v3.999h1.46c.401 0 .734-.08.998-.237a1.45 1.45 0 0 0 .595-.689c.13-.3.196-.662.196-1.084 0-.42-.065-.778-.196-1.075a1.426 1.426 0 0 0-.589-.68c-.264-.156-.599-.234-1.005-.234H3.362Zm.791.645h.563c.248 0 .45.05.609.152a.89.89 0 0 1 .354.454c.079.201.118.452.118.753a2.3 2.3 0 0 1-.068.592 1.14 1.14 0 0 1-.196.422.8.8 0 0 1-.334.252 1.298 1.298 0 0 1-.483.082h-.563v-2.707Zm3.743 1.763v1.591h-.79V11.85h2.548v.653H7.896v1.117h1.606v.638H7.896Z"/>
                                </svg>
                              </button>
                              </a>
                            </td>
                          </tr>`;
          }
          
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
          this.LoadEventTable();
          this._creatEventTable();
        });
      });

  }
  public _creatEventTable() {

    let searchInput = (<HTMLInputElement>document.getElementById("myInput"));
    searchInput.addEventListener('keyup', e => {
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

  private LoadEventTable() {
    /**BTN EDITAR e VIZUALIZAR ITEM LISTA */
    let ButtonEdit = document.querySelectorAll('.EditBtn');
    ButtonEdit.forEach(item => {
      item.addEventListener('click', event => {

        let idItem = item.id;
        let CurrentId: number = parseInt(idItem.split('Btn')[1]);

        this.LoadHtmlModalForm(CurrentId);

      });
    });

  }

  //FORM


  

  
  private ValidaCamposForm() {

    //SEGURADO
    let inputNome = (<HTMLInputElement>document.getElementById('inputName')).value;
    let inputCPF = (<HTMLInputElement>document.getElementById('inputCpf')).value;
    let inputDataNascimento = (<HTMLInputElement>document.getElementById('inputData')).value;
    let inputMatricula = (<HTMLInputElement>document.getElementById('inputMatricula')).value;
    //EMPRESA
    let inputEmpresa = (<HTMLInputElement>document.getElementById('inputEmpresa')).value;
    let inputEstabelecimento = (<HTMLInputElement>document.getElementById('inputEstabelecimento')).value;
    let inputLotacao = (<HTMLInputElement>document.getElementById('inputLotacao')).value;

    //ESTADO DATA ASSINATURA
    let SelectEstado = (<HTMLSelectElement>document.getElementById('inputEstado')).value;
    let inputDataAss = (<HTMLInputElement>document.getElementById('inputDataAss')).value;
    let BtnAssinatura = (<HTMLButtonElement>document.getElementById('ActionAss')).textContent;

    //BENEFICIARIOS
    let contador = document.querySelectorAll('.itemGlo');

    try {
      if (inputNome == "" || inputCPF == "" || inputDataNascimento == "" || inputMatricula == "" || inputEmpresa == "" || inputEstabelecimento == "" || inputLotacao == "" || SelectEstado == "-" || inputDataAss == "" || BtnAssinatura == "") {

        this.modal.ModalError();

      } else {

        if (contador.length > 1) {
          //DOIS OU MAIS BENEFICIARIO
          let somaP: number = 0;
          for (var i = 1; i <= contador.length; i++) {

            let inputNomeBeneficiario = (<HTMLInputElement>document.getElementById('inputNomeBenf' + i)).value;
            let inputCPFBeneficiario = (<HTMLInputElement>document.getElementById('inputCPFBenf' + i)).value;
            let inputDataNascimentoBeneficiario = (<HTMLInputElement>document.getElementById('inputDataBenf' + i)).value;
            let inputTelefoneBaneficiario = (<HTMLInputElement>document.getElementById('inputTelefoneBenf' + i)).value;
            let inputParentescoBeneficiario = (<HTMLInputElement>document.getElementById('inputParentescoBenf' + i)).value;
            let inputPorcentagem = (<HTMLInputElement>document.getElementById('inputPorcentagemBenf' + i)).value;

            let valPor = parseInt(inputPorcentagem.split('%')[0]);
            somaP = somaP + valPor;


            if (inputNomeBeneficiario == "" || inputCPFBeneficiario == "" || inputDataNascimentoBeneficiario == "" || inputTelefoneBaneficiario == "" || inputParentescoBeneficiario == "-" || inputPorcentagem == "") {

              this.modal.ModalError();

            } else {

              if (i == contador.length) {

                if (somaP > 100 || somaP < 100) {

                  alert('A soma dos valores da porcentagem deve ser igual a 100%!');

                  $('.Percent').val('');

                } else {
                  console.log('index e contator iguais >>');
                  console.log('a soma das porcentagens e 100%');

                  this.SalvaDadosSegurado();

                }
              }
            }
          }
        } else {
          //UM BENEFICIARIO


          let inputNomeBeneficiario = (<HTMLInputElement>document.getElementById('inputNomeBenf1')).value;
          let inputCPFBeneficiario = (<HTMLInputElement>document.getElementById('inputCPFBenf1')).value;
          let inputDataNascimentoBeneficiario = (<HTMLInputElement>document.getElementById('inputDataBenf1')).value;
          let inputTelefoneBaneficiario = (<HTMLInputElement>document.getElementById('inputTelefoneBenf1')).value;
          let inputParentescoBeneficiario = (<HTMLInputElement>document.getElementById('inputParentescoBenf1')).value;
          let inputPorcentagem = (<HTMLInputElement>document.getElementById('inputPorcentagemBenf1')).value;

          let valPor = parseInt(inputPorcentagem.split('%')[0]);

          if (inputNomeBeneficiario == "" || inputCPFBeneficiario == "" || inputDataNascimentoBeneficiario == "" || inputTelefoneBaneficiario == "" || inputParentescoBeneficiario == "-" || inputPorcentagem == "") {

            this.modal.ModalError();

          } else {

            if (valPor > 100 || valPor < 100) {

              alert('A pocentagem deve ser igual a 100%');
              $('.Percent').val('');


            } else {

              this.SalvaDadosSegurado();

            }
          }
        }
      }
    } catch (error) {
      this.modal.ModalAviso();
    }
  }


  //MODAL EDICAO 
  private LoadHtmlModalForm(ID: number) {

    let htmlFormEditSegurado: string = "";

    this.ConsultaCadSeguradoService.getCadSegurado(ID)
      .then((Segurado: ICadSeguradoListItem) => {

        let stat = Segurado.Status;

        if (stat === "Pendente") {
          this.tableFormulario.htmlTablePopuladoPendente(Segurado);
          let btnSalvaAlteracoes = (<HTMLButtonElement>document.getElementById('SalvarAlteracoes'));
          btnSalvaAlteracoes.style.display = "none";

        } else {
          this.tableFormulario.htmlTablePopuladoReprovado(Segurado);
        }

        let HTMLmodalFormEdit: HTMLElement = document.getElementById('ConteudoModalEdicao');
        HTMLmodalFormEdit.innerHTML = htmlFormEditSegurado;
        this.LoadhtmlModalFormItens(ID, stat);
      });

  }
  private LoadhtmlModalFormItens(ID: number, Status: string) {

    let htmlFormEditBeneficiario: string = "";

    this.ConsultaCadBeneficiarioService.getBeneficiarios(ID)
      .then((Beneficiario: ICadBeneficiarioListItem[]) => {
        Beneficiario.forEach(element => {

          if (Status === "Reprovado") {
            htmlFormEditBeneficiario = htmlFormEditBeneficiario + `
              <div class="form-row">
                <div class="form-group col-lg-3 col-md-12">
                    <label for="inputNomeBenf${element.ID}">Nome Beneficiário</label>
                    <input type="text" class="form-control form-control-sm" id="inputNomeBenf1${element.ID}" value="${element.Nome}">
                </div>
                <div class="form-group col-lg-2 col-md-12">
                    <label for="inputCPFBenf${element.ID}">CPF</label>
                    <input type="text" class="CPF form-control form-control-sm" id="inputCPFBenf1${element.ID}" value="${element.CPF}">
                </div>
                <div class="form-group col-lg-2 col-md-12">
                    <label for="inputDataBenf${element.ID}">Nascimento</label> 
                    <input type="text" class="Date form-control form-control-sm" id="inputDataBenf1${element.ID}" value="${element.DataNascimento}">
                </div>
                <div class="form-group col-lg-2 col-md-12">
                    <label for="inputTelefoneBenf${element.ID}">Telefone</label>
                    <input type="text" class="Telefone form-control form-control-sm" id="inputTelefoneBenf1${element.ID}" value="${element.Telefone}">
                </div>
                <div class="form-group col-lg-2 col-md-12">
                  <label for="inputParentescoBenf${element.ID}">Parentesco</label>
                  <select id="inputParentescoBenf${element.ID}" class="form-control form-control-sm">
                    <option selected>${element.Parentesco}</option>
                  </select>
                </div>
                <div class="form-group col-lg-1 col-md-12">
                    <label for="inputPorcentagemBenf${element.ID}"> %</label>
                    <input type="text" class="Percent form-control form-control-sm" id="inputPorcentagemBenf1${element.ID}" value="${element.Porcentagem}">
                </div>
              </div>
            `;
          } else {
            //DISABELD
            htmlFormEditBeneficiario = htmlFormEditBeneficiario + `
              <div class="form-row">
                <div class="form-group col-lg-3 col-md-12">
                    <label for="inputNomeBenf${element.ID}">Nome Beneficiário</label>
                    <input type="text" class="form-control form-control-sm" id="inputNomeBenf1${element.ID}" value="${element.Nome}" disabled>
                </div>
                <div class="form-group col-lg-2 col-md-12">
                    <label for="inputCPFBenf${element.ID}">CPF</label>
                    <input type="text" class="CPF form-control form-control-sm" id="inputCPFBenf1${element.ID}" value="${element.CPF}" disabled>
                </div>
                <div class="form-group col-lg-2 col-md-12">
                    <label for="inputDataBenf${element.ID}">Nascimento</label> 
                    <input type="text" class="Date form-control form-control-sm" id="inputDataBenf1${element.ID}" value="${element.DataNascimento}" disabled>
                </div>
                <div class="form-group col-lg-2 col-md-12">
                    <label for="inputTelefoneBenf${element.ID}">Telefone</label>
                    <input type="text" class="Telefone form-control form-control-sm" id="inputTelefoneBenf1${element.ID}" value="${element.Telefone}" disabled>
                </div>
                <div class="form-group col-lg-2 col-md-12">
                  <label for="inputParentescoBenf${element.ID}">Parentesco</label>
                  <select id="inputParentescoBenf${element.ID}" class="form-control form-control-sm" disabled>
                    <option selected>${element.Parentesco}</option>
                  </select>
                </div>
                <div class="form-group col-lg-1 col-md-12">
                    <label for="inputPorcentagemBenf${element.ID}"> %</label>
                    <input type="text" class="Percent form-control form-control-sm" id="inputPorcentagemBenf1${element.ID}" value="${element.Porcentagem}" disabled>
                </div>
              </div>
            `;
          }
        });
        let HTMLmodalEditItens = document.getElementById('ItensModalEdit');
        HTMLmodalEditItens.innerHTML = htmlFormEditBeneficiario;
        $('#ModalEdicao').modal();
        this.LoadEventModal();
      });
  }
  private LoadEventModal() {
    //BTN SALVA ALTERACOES BENEFICIARIOS
    let BtnConfirmaAlteracao = document.getElementById('SalvarAlteracoes');
    BtnConfirmaAlteracao.addEventListener('click', (element) => {

      console.log('entrou no event salva alteracoes');

    });

    //MODAL EDIT
    let ButtonEdit = document.querySelectorAll('.EditBtn');
    ButtonEdit.forEach(item => {
      item.addEventListener('click', event => {

        let idItem = item.id;
        let CurrentId: number = parseInt(idItem.split('Btn')[1]);

        this.LoadHtmlModalForm(CurrentId);

      });
    });

    /*INPUT ASSINATURA */
    let SignatureBtn = (<HTMLButtonElement>document.getElementById('ActionAss'));
    SignatureBtn.addEventListener('click', (e) => {

      this.GetAssinatura();

    });

    /*BOTAO ADICIONA BENEFICIARIO*/
    let newbenf = document.getElementById('ItensModalEdit');
    let addbenf = document.getElementById('addbenf');
    let cont: number = 1;
    addbenf.addEventListener('click', (e) => {
      cont = cont + 1;

      newbenf.innerHTML += `<div class="form-row">
                    <div class="form-group col-lg-3 col-md-12">
                        <label for="inputNomeBenf${cont}">Nome beneficiario</label>
                        <input type="text" class="form-control form-control-sm" id="inputNomeBenf${cont}">
                    </div>
                    <div class="form-group col-lg-2 col-md-12">
                        <label for="inputCPFBenf">CPF</label>
                        <input type="text" class="CPF form-control form-control-sm" id="inputCPFBenf${cont}">
                    </div>
                    <div class="form-group col-lg-2 col-md-12">
                        <label for="inputDataBenf${cont}">Nascimento</label>
                        <input type="text" class="Date form-control form-control-sm" id="inputDataBenf${cont}">
                    </div>
                    <div class="form-group col-lg-2 col-md-12">
                        <label for="inputTelefoneBenf${cont}">Telefone</label>
                        <input type="text" class="Telefone form-control form-control-sm" id="inputTelefoneBenf${cont}">
                    </div>
                    <div class="form-group col-lg-2 col-md-12">
                        <label for="inputParentescoBenf${cont}">Parentesco</label>
                        <select id="inputParentescoBenf${cont}" class="form-control form-control-sm">
                            <option>-</option>
                            <option>Avós</option>
                            <option>Companheiro</option>
                            <option>Cônjuge</option>
                            <option>Filho/Enteado</option>
                            <option>Netos</option>
                            <option>Pais</option>
                            <option>Primos</option>
                            <option>Sobrinhos</option>
                            <option>Tios</option>
                            <option>Irmão</option>
                            <option>Outro</option>
                        </select>
                    </div>
                    <div class="form-group col-lg-1 col-md-12">
                        <label for="inputPorcentagemBenf${cont}"> %</label>
                        <input type="text" class="Percent form-control form-control-sm" id="inputPorcentagemBenf${cont}">
                    </div>
                </div>`;

      this.LoadCamposForm();

    });

    //Data 
    let mesEmPortugues;
    var data = new Date();
    var dia = data.getDate();
    var Mes = data.getMonth();
    var ano = data.getFullYear();
    Arrumadata(Mes);

    function Arrumadata(mes) {

      if (Mes == 0) {
        mesEmPortugues = "Janeiro";
      }
      if (
        Mes == 1) {
        mesEmPortugues = "Fevereiro";
      }
      if (Mes == 2) {
        mesEmPortugues = "Março";
      }
      if (Mes == 3) {
        mesEmPortugues = "Abril";
      }
      if (Mes == 4) {
        mesEmPortugues = "Maio";
      }
      if (Mes == 5) {
        mesEmPortugues = "Junho";
      }
      if (Mes == 6) {
        mesEmPortugues = "Julho";
      }
      if (Mes == 7) {
        mesEmPortugues = "Agosto";
      }
      if (Mes == 8) {
        mesEmPortugues = "Setembro";
      }
      if (Mes == 9) {
        mesEmPortugues = "Outubro";
      }
      if (Mes == 10) {
        mesEmPortugues = "Novembro";
      }
      if (Mes == 11) {
        mesEmPortugues = "Dezembro";
      }
    }
    var DataArrumada = dia + ' de ' + mesEmPortugues + ' de ' + ano;
    let inputDataAss: HTMLInputElement = <HTMLInputElement>document.getElementById("inputDataAss");
    inputDataAss.value = DataArrumada;
    /* Data */


  }

  
  //POST ITEM  
  private SalvaDadosSegurado() {

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
    let ValueEstado = (<HTMLSelectElement>document.getElementById('inputEstado')).value;
    let ValueDataAss = (<HTMLInputElement>document.getElementById('inputDataAss')).value;
    let ValueAssinatura = (<HTMLButtonElement>document.getElementById('ActionAss')).textContent;

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
      Assinatura: ValueAssinatura,
    };

    this.CadastraCadSeguradoService.CreateCadSegurado(newCadSegurado)
      .then(() => {

        return this.BuscaIDSeguradoSalvo();

      });

  }
  private BuscaIDSeguradoSalvo() {

    //this.ConsultaCadSeguradoService.getLastSegurado()
    this.ConsultaLastIdService.getLastSegurado()
      .then((response: ICadSeguradoListItem) => {

        let IDAsseg: number = response.ID;

        return this.SalvaDadosBeneficiarios(IDAsseg);

      });

  }
  private async SalvaDadosBeneficiarios(SeguradoID: number) {
    let itemG = document.querySelectorAll('.itemGlo');


    if (itemG.length > 1) {
      //MUTIPLE BENEFICIARIOS

      for (var i = 1; i <= itemG.length; i++) {

        let ValueNomeBeneficiario = (<HTMLInputElement>document.getElementById('inputNomeBenf' + i)).value;
        let ValueCPFBeneficiario = (<HTMLInputElement>document.getElementById('inputCPFBenf' + i)).value;
        let ValueDataNascimentoBeneficiario = (<HTMLInputElement>document.getElementById('inputDataBenf' + i)).value;
        let ValueTelefoneBaneficiario = (<HTMLInputElement>document.getElementById('inputTelefoneBenf' + i)).value;
        let ValueParentescoBeneficiario = (<HTMLInputElement>document.getElementById('inputParentescoBenf' + i)).value;
        let ValuePorcentagem = (<HTMLInputElement>document.getElementById('inputPorcentagemBenf' + i)).value;

        const newCadBeneficiario: ICadBeneficiarioListItem = <ICadBeneficiarioListItem>{

          IDSegurado: SeguradoID,
          Nome: ValueNomeBeneficiario,
          CPF: ValueCPFBeneficiario,
          DataNascimento: ValueDataNascimentoBeneficiario,
          Telefone: ValueTelefoneBaneficiario,
          Parentesco: ValueParentescoBeneficiario,
          Porcentagem: ValuePorcentagem,
        };

        this.CadastraCadBeneficiarioService.CreateCadBeneficiario(newCadBeneficiario);

      }

      this.modal.ModalSucesso();
      let SignatureBtn = (<HTMLButtonElement>document.getElementById('ActionAss'));
      SignatureBtn.innerText = '';
      $("#FormularioSVP").trigger("reset");
      this.render();

    }
    else {

      // SINGLE BENEFICIARIO
      let ValueNomeBeneficiario = (<HTMLInputElement>document.getElementById('inputNomeBenf1')).value;
      let ValueCPFBeneficiario = (<HTMLInputElement>document.getElementById('inputCPFBenf1')).value;
      let ValueDataNascimentoBeneficiario = (<HTMLInputElement>document.getElementById('inputDataBenf1')).value;
      let ValueTelefoneBaneficiario = (<HTMLInputElement>document.getElementById('inputTelefoneBenf1')).value;
      let ValueParentescoBeneficiario = (<HTMLInputElement>document.getElementById('inputParentescoBenf1')).value;
      let ValuePorcentagem = (<HTMLInputElement>document.getElementById('inputPorcentagemBenf1')).value;

      const newCadBeneficiario: ICadBeneficiarioListItem = <ICadBeneficiarioListItem>{

        IDSegurado: SeguradoID,
        Nome: ValueNomeBeneficiario,
        CPF: ValueCPFBeneficiario,
        DataNascimento: ValueDataNascimentoBeneficiario,
        Telefone: ValueTelefoneBaneficiario,
        Parentesco: ValueParentescoBeneficiario,
        Porcentagem: ValuePorcentagem,
      };

      this.CadastraCadBeneficiarioService.CreateCadBeneficiario(newCadBeneficiario);

      this.modal.ModalSucesso();
      let SignatureBtn = (<HTMLButtonElement>document.getElementById('ActionAss'));
      SignatureBtn.innerText = '';
      $("#FormularioSVP").trigger("reset");
      this.render();
    }
  }
 

  //ASSINATURA
  private async UploadDadosAssinatura() {
    let files = (<HTMLInputElement>document.getElementById('formFile')).files;
    let file = files[0];
    var data = new Date();
    var dia = (data.getDate().toString().length === 2) ? data.getDate() : '0' + data.getDate();                 // 1-31
    var mes = data.getMonth();                                                                                 // 2 dígitos
    var ano = data.getFullYear();                                                                               // 4 dígitos
    var hora = (data.getHours().toString().length === 2) ? data.getHours() : '0' + data.getHours();              // 0-23
    var min = (data.getMinutes().toString().length === 2) ? data.getMinutes() : '0' + data.getMinutes();        // 0-59
    var seg = (data.getSeconds().toString().length === 2) ? data.getSeconds() : '0' + data.getSeconds();        // 0-59

    var str_data = (mes + 1).toString().length === 2 ? (mes + 1) : '0' + (mes + 1) + '-' + dia + '-' + ano;
    var str_hora = hora + '-' + min + '-' + seg;

    if (file != undefined || file != null) {

      let spOpts: ISPHttpClientOptions = {
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        body: file,

      };

      let web = new Web(this.context.pageContext.web.absoluteUrl);

      {
        // large upload
        web.getFolderByServerRelativeUrl("/sites/DEV/SignatureData/").files.addChunked(str_data + "_" + str_hora + "_" + file.name, file, run => {

          let myNumber: number = parseInt(((run.currentPointer / run.fileSize) * 100).toString());
          myNumber.toFixed();

        }, true)

          .then(result => {

            console.log(file.name + " upload successfully!");

            let LastId: number;

            return this.ConsultaAssinaturaService.getLastAssinatura()
              .then((item: IAssinaturaDigitalListItem) => {

                LastId = item.ID;
                return this.UpdateDadosAssinatura(LastId);

              });

          });
      }
    }

  }
  
  private UpdateDadosAssinatura(LastId: number) {

    var chars = "0123456789" + "ABCDEFGHIJKLMNOPQRSTUVWXYZ" + "abcdefghijklmnopqrstuvwxyz" + "!@#$%&";
    var string_length = 16;
    var randomstring32 = '';

    for (var i = 0; i < string_length; i++) {
      var rnum = Math.floor(Math.random() * chars.length);
      randomstring32 += chars.substring(rnum, rnum + 1);
    }

    let web = new Web(this.context.pageContext.web.absoluteUrl);

    let item = web.lists.getByTitle("SignatureData").items.getById(LastId);
    item.update({

      NomeUsuario: this.context.pageContext.user.displayName,
      EmailUsuario: this.context.pageContext.user.email,
      HashCode: randomstring32,

    }).then(r => {

      console.log(" properties updated successfully!");
      (<HTMLInputElement>document.getElementById('formFile')).value = "";
      $('#ModalUploadAssinatura').modal('hide');
      this.modal.ModalSucessoAssinatura();

    });
  }

  private GetAssinatura() {

    const UserName = this.context.pageContext.user.displayName;
    const UserEmail = this.context.pageContext.user.email;

    this.ConsultaAssinaturaService.getAssinaturas(UserName, UserEmail)
      .then((Signature: IAssinaturaDigitalListItem[]) => {
        if (Signature && Signature.length > 0) {

          let ChrHash: string = Signature[0].HashCode;
          let NUser: string = Signature[0].NomeUsuario;

          this.modal.ModalSignatureTrue(ChrHash, NUser);

        } else {

          this.ModalSignatureFalse();

        }
      });
  }

  public async ModalSignatureFalse() {

    const UserName = this.context.pageContext.user.displayName;
    const UserEmail = this.context.pageContext.user.email;

    let areaname: HTMLElement = document.getElementById('NameModal');
    areaname.innerHTML = UserName;
    let areaemail: HTMLElement = document.getElementById('EmailModal');
    areaemail.innerHTML = UserEmail;
    $('#ModalUploadAssinatura').modal();
  }

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
