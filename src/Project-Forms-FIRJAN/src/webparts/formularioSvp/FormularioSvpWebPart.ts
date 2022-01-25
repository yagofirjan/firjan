import { Version } from '@microsoft/sp-core-library';

import { IPropertyPaneConfiguration, PropertyPaneTextField } from '@microsoft/sp-property-pane';

import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import { AadHttpClient, HttpClientResponse } from '@microsoft/sp-http';

import { escape } from '@microsoft/sp-lodash-subset';

import styles from './FormularioSvpWebPart.module.scss';

import * as strings from 'FormularioSvpWebPartStrings';

import * as $ from 'jquery';

import 'bootstrap';

import { ICadSeguradoListItem, ICadBeneficiarioListItem, IApiSwaggerListItem, IAssinaturaDigitalListItem } from '../../models';

import { CadSeguradoService, CadBeneficiarioService, ApiSwaggerService, AssinaturaDigitalService } from '../../service';

require('../../../node_modules/bootstrap/dist/css/bootstrap.min.css');

require('../../styles/formStyles.css');

require('jquery-mask-plugin');

import Swal from 'sweetalert2';

import 'jquery-mask-plugin';

import { Web } from "sp-pnp-js/lib/pnp";
import { sp } from "@pnp/sp/presets/all";

export interface IFormularioSvpWebPartProps {
  description: string;
}

export default class FormularioSvpWebPart extends BaseClientSideWebPart<IFormularioSvpWebPartProps> {

  //INICIO
  private ordersClient: AadHttpClient;
  private ConsultaApiService: ApiSwaggerService;

  private ConsultaCadSeguradoService: CadSeguradoService;
  private CadastraCadSeguradoService: CadSeguradoService;
  private ConsultaLastIdService: CadSeguradoService;

  private ConsultaCadBeneficiarioService: CadBeneficiarioService;
  private CadastraCadBeneficiarioService: CadBeneficiarioService;

  private ConsultaAssinaturaDigitalService: AssinaturaDigitalService;
  private CadastraAssinaturaDigitalService: AssinaturaDigitalService;

  //ONINIT 
  protected onInit(): Promise<void> {

    this.ConsultaCadSeguradoService = new CadSeguradoService(this.context.pageContext.web.absoluteUrl, this.context.spHttpClient);
    this.CadastraCadSeguradoService = new CadSeguradoService(this.context.pageContext.web.absoluteUrl, this.context.spHttpClient);
    this.ConsultaLastIdService = new CadSeguradoService(this.context.pageContext.web.absoluteUrl, this.context.spHttpClient);

    this.ConsultaCadBeneficiarioService = new CadBeneficiarioService(this.context.pageContext.web.absoluteUrl, this.context.spHttpClient);
    this.CadastraCadBeneficiarioService = new CadBeneficiarioService(this.context.pageContext.web.absoluteUrl, this.context.spHttpClient);

    this.ConsultaAssinaturaDigitalService = new AssinaturaDigitalService(this.context.pageContext.web.absoluteUrl, this.context.spHttpClient);
    this.CadastraAssinaturaDigitalService = new AssinaturaDigitalService(this.context.pageContext.web.absoluteUrl, this.context.spHttpClient);


    return new Promise<void>((resolve: () => void, reject: (error: any) => void): void => {
      this.context.aadHttpClientFactory
        .getClient('6bc8bca8-5866-405d-b236-9200bdbb73c0')
        .then((client: AadHttpClient): void => {
          this.ordersClient = client;
          resolve();
        }, err => reject(err));
    });

  }

  //ELEMENTS PAI FORM E TABLE
  private HTMLRenderForm: HTMLElement; /*ID RenderForm*/
  private HTMLRenderTable: HTMLElement; /*ID RenderTable*/

  //ELEMENTS ITENS TABLE
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

            const HtmlForm: string = `<div id="RenderForm"><h1>HTML FORMULARIO<h1></div>`;
            this.domElement.innerHTML = HtmlForm;
            this.LoadHtmlForm();
            this.LoadEventForm();
            this.LoadCamposForm();
            //this.ConsultaAPISwagger();

          }
        });
    } catch (Exception) {

      this.ModalAviso();

    }
  }
  private ConsultaAPISwagger() {

    //SEGURADO
    let LoadNome = (<HTMLInputElement>document.getElementById('inputName'));
    let LoadCPF = (<HTMLInputElement>document.getElementById('inputCpf'));
    let LoadDataNascimento = (<HTMLInputElement>document.getElementById('inputData'));
    let LoadMatricula = (<HTMLInputElement>document.getElementById('inputMatricula'));
    //EMPRESA
    let LoadEmpresa = (<HTMLInputElement>document.getElementById('inputEmpresa'));
    let LoadEstabelecimento = (<HTMLInputElement>document.getElementById('inputEstabelecimento'));
    let LoadLotacao = (<HTMLInputElement>document.getElementById('inputLotacao'));

    //CHAMADA DA REQ API

    LoadNome.value = '';
    LoadCPF.value = '';
    LoadDataNascimento.value = '';
    LoadMatricula.value = '';
    LoadEmpresa.value = '';
    LoadEstabelecimento.value = '';
    LoadLotacao.value = '';

  }
  private GetAssinatura() {

    //verificar lista de assinatura se ja existe senha cadastrada 
    //sim - exibe modal de verificacao (Deseja assinar digitalmente)
    //nao - exibe modal para cadastrar (username, email, upload de assinatura)
    const UserName = this.context.pageContext.user.displayName;
    const UserEmail = this.context.pageContext.user.email;

    this.ConsultaAssinaturaDigitalService.getAssinaturas(UserName, UserEmail)
      .then((Signature: IAssinaturaDigitalListItem[]) => {
        if (Signature && Signature.length > 0) {

          let ChrHash: string = Signature[0].HashCode;

          this.ModalSignatureTrue(ChrHash);

        } else {

          this.ModalSignatureFalse();

        }
      });
  }

  //TABLE
  private LoadHtmlTable() {
    let htmlTable: string = `<div class="table-responsive" style="min-width: 900px;">
                      <table class="table table-hover">
                        <thead class="thead-blue">
                          <tr>
                            <th scope="col-3">Formulario</th>
                            <th scope="col-3">Data Assinatura</th>
                            <th scope="col-3">Status</th>
                            <th scope="col-2">Opções</th>
                          </tr>
                        </thead>
                        <tbody id="TableTR">
                          
                        </tbody>
                      </table>
                    </div>
                    
                    <!-- Modal Edicao -->
                      <div class="modal fade" id="ModalEdicao" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true" style=" justify-content:center;align-items:center">
                        <div class="modal-dialog" style="max-width:1000px" role="document">
                          <div class="modal-content">
                            <div class="modal-body" style="max-width:1000px">
                              <div id="ConteudoModalEdicao">

                              </div>
                            </div>
                            <div class="modal-footer">
                              <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancelar</button>
                              <button type="button" class="btn btn-primary" id="SalvarAlteracoes">Salvar Alterações</button>
                            </div>
                          </div>
                        </div>
                      </div>`;

    this.HTMLRenderTable = document.getElementById('RenderTable');
    this.HTMLRenderTable.innerHTML = htmlTable;

    this.LoadHtmlItensTable();
  }
  private LoadHtmlItensTable() {
    const url = this.context.pageContext.web.absoluteUrl;
    const newURL: string = url.split('/sites')[0];

    const UserName = this.context.pageContext.user.displayName;
    this.ConsultaCadSeguradoService.getCadSegurados(UserName)
      .then((response: ICadSeguradoListItem[]) => {
        let HtmlItensTable: string = "";

        response.forEach((item: ICadSeguradoListItem) => {

          if (item.Status === "Reprovado") {
            if(item.AttachmentFiles.Attachments == true) {
              HtmlItensTable = HtmlItensTable + `
                  <tr id="${item.ID}">
                    <td>Termo de Nomeação de Beneficiários</td>
                    <td>${item.DataAssinatura}</td>
                    <td>${item.Status}</td>
                    <td id="TdOptions${item.ID}">
                      <button type="submit" class="EditBtn" id="EditBtn${item.ID}">
                        <span class="bi bi-pencil-square" style="font-size: 18px;"></span>
                      </button>
                      
                      <a href="${newURL}${item.AttachmentFiles[0].ServerRelativeUrl}" target="_blank">
                        <button type="submit" class="VizuBtn" id="VizuBtn${item.ID}">
                          <span class="bi-search" style="font-size: 18px;"></span>
                        </button>
                      </a> 
                    </td>
                  </tr>`;
              
            } else {
             
              HtmlItensTable = HtmlItensTable + `
                  <tr id="${item.ID}">
                    <td>Termo de Nomeação de Beneficiários</td>
                    <td>${item.DataAssinatura}</td>
                    <td>${item.Status}</td>
                    <td id="TdOptions${item.ID}">
                      <button type="submit" class="EditBtn" id="EditBtn${item.ID}">
                        <span class="bi bi-pencil-square" style="font-size: 18px;"></span>
                      </button>
                      <div>Processando</div>
                    </td>
                  </tr>`;
            }
          } else {
            if (item.AttachmentFiles.Attachments == true) {
              HtmlItensTable = HtmlItensTable + `
                  <tr id="${item.ID}">
                    <td>Termo de Nomeação de Beneficiários</td>
                    <td>${item.DataAssinatura}</td>
                    <td>${item.Status}</td>
                    <td id="TdOptions${item.ID}">
                                           
                      <a href="${newURL}${item.AttachmentFiles[0].ServerRelativeUrl}" target="_blank">
                        <button type="submit" class="VizuBtn" id="VizuBtn${item.ID}">
                          <span class="bi-search" style="font-size: 18px;"></span>
                        </button>
                      </a> 
                    </td>
                  </tr>`;

            } else {

              HtmlItensTable = HtmlItensTable + `
                  <tr id="${item.ID}">
                    <td>Termo de Nomeação de Beneficiários</td>
                    <td>${item.DataAssinatura}</td>
                    <td>${item.Status}</td>
                    <td id="TdOptions${item.ID}">
                      <div>Processando</div>
                    </td>
                  </tr>`;
              
            }
          }
          this.HTMLTableItens = document.getElementById('TableTR');
          this.HTMLTableItens.innerHTML = HtmlItensTable;
          this.LoadEventTable();
        });
      });

  }
  private LoadEventTable() {
    /**BTN EDITAR ITEM LISTA */
    let ButtonEdit = document.querySelectorAll('.EditBtn');
    ButtonEdit.forEach(item => {
      item.addEventListener('click', event => {

        let idItem = item.id;
        let CurrentId: number = parseInt(idItem.split('Btn')[1]);

        this.LoadHtmlModalForm(CurrentId);

      });
    });

    let BtnConfirmaAlteracao = document.getElementById('SalvarAlteracoes');
    BtnConfirmaAlteracao.addEventListener('click', () => {

      //salva as alteracoes realizadas nos itens.
      //e muda o status novamente. para pendente.


    });

  }

  //FALTA FINALIZAR
  private LoadHtmlModalForm(ID: number) {

    let htmlFormEditSegurado: string = "";

    this.ConsultaCadSeguradoService.getCadSegurado(ID)
      .then((Segurado: ICadSeguradoListItem) => {
        console.log(Segurado);

        htmlFormEditSegurado = `<div class="paper">
                    <div>
                      <div class="form-header row justify-content-between">
                        <div class="form-header-logo col-lg-2 col-md-12">
                            <img src="../img/FormResource.jfif" alt="Logo">
                        </div>
                        <div class="form-header-title col-lg-9 col-md-12">
                            <h1 class="Htitle">Termo de Nomeação de Beneficiários Seguro de Vida de Pessoas</h1>
                        </div>
                      </div>
                      <form id="FormularioSVP" name="FormularioSVP">
                          <!-- Segurado -->
                          <fieldset>
                              <legend>Dados do Segurado</legend>
                              <div class="form-row">

                                  <div class="form-group col-md-6">
                                      <label for="inputName">Nome completo</label>
                                      <input type="text" class="form-control form-control-sm" id="inputName" name="inputName" value="${Segurado.Nome}">
                                  </div>
                                  <div class="form-group col-md-6">
                                      <label for="inputCpf">CPF</label>
                                      <input type="text" class="CPF form-control form-control-sm" id="inputCpf" value="${Segurado.CPF}">
                                  </div>
                              </div>
                              <div class="form-row">
                                  <div class="form-group col-md-6">
                                      <label for="inputData">Data de nascimento</label>
                                      <input type="text" class="Date form-control form-control-sm" id="inputData" value="${Segurado.DataNascimento}">
                                  </div>
                                  <div class="form-group col-md-6">
                                      <label for="inputMatricula">Matricula</label>
                                      <input type="text" class="form-control form-control-sm" id="inputMatricula" value="${Segurado.Matricula}">
                                  </div>
                              </div>
                          </fieldset>
                          <!-- Empresa -->
                          <fieldset>
                            <legend>Dados da Empresa</legend>
                            <div class="form-row">
                                <div class="form-group col-md-4">
                                    <label for="inputEmpresa">Empresa</label>
                                    <input type="text" class="form-control form-control-sm" id="inputEmpresa" placeholder="Firjan-SENAI"value="${Segurado.Empresa}">
                                </div>
                                <div class="form-group col-md-4">
                                    <label for="inputEstabelecimento">Estabelecimento</label>
                                    <input type="text" class="form-control form-control-sm" id="inputEstabelecimento" value="${Segurado.Estabelecimento}">
                                </div>
                                <div class="form-group col-md-4">
                                    <label for="inputLotacao">Lotação</label>
                                    <input type="text" class="form-control form-control-sm" id="inputLotacao" value="${Segurado.Lotacao}">
                                </div>
                            </div>
                          </fieldset>
                          <!-- Termo -->
                          <div class="controler-text">
                              <p><b>Na qualidade de segurado da apólice contratada pela Entidade para seus empregados, nomeio por
                                      este termo que vai por mim assinado, como meus beneficiários, as pessoas abaixo
                                      indicadas:</b></p>
                          </div>
                          <!-- beneficiarios -->
                          <fieldset>
                              <legend>Dados dos Beneficiarios</legend>
                              <div id="ItensModalEdit">
                              <!-- conteudo dinamico -->
                                  



                                  <!-- conteudo dinamico -->
                              </div>
                              <div class="form-row justify-content-between">
                                <a id="addbenf" href="#" ">+ beneficiario</a>

                              </div>
                          </fieldset>
                          <!-- Avisos -->
                          <fieldset>
                              <legend>Dados Importantes</legend>
                              <ul class="myUl">
                                  <li>Os Titulares do seguro deverão manifestar livremente sua vontade na indicação de seus
                                      beneficiários, podendo indicar qualquer pessoa como beneficiário, e não somente os
                                      dependentes
                                      legais;</li>
                                  <li>Para segurado maior de 16 anos e menor de 18 anos, a assinatura deverá ser em conjunto com
                                      seu
                                      representante legal, e se menor de 16 anos, a assinatura deverá ser somente do seu
                                      representante
                                      legal. Para ambos os casos será necessário o envio de uma cópia do RG e CPF do representante
                                      legal, junto com a certidão de nascimento e/ou documento legal que comprove a
                                      responsabilidade
                                      sobre o menor</li>
                                  <li>Caso o segurado se encontre impossibilitado, ou não saiba assinar, deverá ser colhida sua
                                      impressão digital e a assinatura de um representante (assinatura a rogo). Também deverá ser
                                      encaminhada cópia de um documento de identificação que sirva de comprovação da assinatura do
                                      representante.</li>
                                  <li>Deverão ser preenchidos todos os campos do formulário, inclusive o percentual de
                                      participação de
                                      cada beneficiário;</li>
                                  <li>No preenchimento incorreto ou incompleto do formulário, este não acatado e serão mantidos os
                                      beneficiários indicados anteriormente. Caso ainda não tenham sido indicados, os
                                      beneficiários
                                      serão definidos pela legislação vigente na data do evento;</li>
                                  <li>Na falta de indicação de beneficiário (s), a indenização do seguro será para de acordo com a
                                      legislação vigente
                                  </li>
                                  <li>Em caso de óbito a família deverá informar à GRB - Gerência de Remuneração e Benefícios.
                                  </li>
                              </ul>
                          </fieldset>
                          <!-- Assinatura -->
                          <fieldset>
                              <legend>Assinatura</legend>
                              <div class="form-row">
                                  <div class="form-group col-md-3">
                                      <div>
                                          <label for="inputEstado">Estado</label>
                                          <select id="inputEstado" class="form-control form-control-sm" value="${Segurado.Estado}">
                                              <option selected>-</option>
                                              <option>ACRE</option>
                                              <option>PARÁ</option>
                                              <option>RONDÔNIA</option>
                                              <option>RORAIMA</option>
                                              <option>TOCANTINS</option>
                                              <option>MARANHÃO</option>
                                              <option>PARAÍBA</option>
                                              <option>PERNAMBUCO</option>
                                              <option>PIAUÍ</option>
                                              <option>RIO GRANDE DO NORTE</option>
                                              <option>SERGIPE</option>
                                              <option>GOIÁS</option>
                                              <option>MATO GROSSO DO SUL</option>
                                              <option>MATO GROSSO</option>
                                              <option>ESPÍRITO SANTO</option>
                                              <option>MINAS GERAIS</option>
                                              <option>RIO DE JANEIRO</option>
                                              <option>SÃO PAULO</option>
                                              <option>RIO GRANDE DO SUL</option>
                                              <option>SANTA CATARINA</option>
                                              <option>AMAZONAS</option>
                                              <option>AMAPÁ</option>
                                              <option>ALAGOAS</option>
                                              <option>BAHIA</option>
                                              <option>CEARÁ</option>
                                              <option>PARANÁ</option>
                                          </select>
                                      </div>
                                  </div>
                                  <div class="form-group col-md-4" id="signature">
                                      <label for="inputDataAss">Data</label>
                                      <input type="text" class="form-control form-control-sm" id="inputDataAss" readonly>
                                  </div>
                                  <div class="form-group col-md-5">
                                      <label for="inputAss">Assinatura</label>
                                      <buttom type="button" class="BtnAss form-control form-control-sm" id="ActionAss"><buttom>
                                  </div>
                                  
                              </div>
                          </fieldset>
                      </form>
                      </div>
                   </div>`;

        let HTMLmodalFormEdit: HTMLElement = document.getElementById('ConteudoModalEdicao');

        HTMLmodalFormEdit.innerHTML = htmlFormEditSegurado;

        this.LoadhtmlModalFormItens(ID);
      });
    //this.LoadhtmlModalFormItens(ID);

  }
  private LoadhtmlModalFormItens(ID: number) {

    let htmlFormEditBeneficiario: string = "";

    this.ConsultaCadBeneficiarioService.getBeneficiarios(ID)
      .then((Beneficiario: ICadBeneficiarioListItem[]) => {
        Beneficiario.forEach(element => {

          htmlFormEditBeneficiario = htmlFormEditBeneficiario + `
                                            <div class="form-row">
                                              <div class="form-group col-lg-3 col-md-12">
                                                  <label for="inputNomeBenf1">Nome beneficiario</label>
                                                  <input type="text" class="form-control form-control-sm" id="inputNomeBenf1" value="${element.Nome}">
                                              </div>
                                              <div class="form-group col-lg-2 col-md-12">
                                                  <label for="inputCPFBenf1">CPF</label>
                                                  <input type="text" class="CPF form-control form-control-sm" id="inputCPFBenf1" value="${element.CPF}">
                                              </div>
                                              <div class="form-group col-lg-2 col-md-12">
                                                  <label for="inputDataBenf1">Nascimento</label>
                                                  <input type="text" class="Date form-control form-control-sm" id="inputDataBenf1" value="${element.DataNascimento}">
                                              </div>
                                              <div class="form-group col-lg-2 col-md-12">
                                                  <label for="inputTelefoneBenf1">Telefone</label>
                                                  <input type="text" class="Telefone form-control form-control-sm" id="inputTelefoneBenf1" value="${element.Telefone}">
                                              </div>
                                              <div class="form-group col-lg-2 col-md-12">
                                                  <label for="inputParentescoBenf1">Parentesco</label>
                                                  <input type="text" class="form-control form-control-sm" id="inputParentescoBenf1" value="${element.Parentesco}">
                                              </div>
                                              <div class="form-group col-lg-1 col-md-12">
                                                  <label for="inputPorcentagemBenf1"> %</label>
                                                  <input type="text" class="Percent form-control form-control-sm" id="inputPorcentagemBenf1" value="${element.Porcentagem}">
                                              </div>
                                            </div>
                                            `;
        });
        let HTMLmodalEditItens = document.getElementById('ItensModalEdit');

        HTMLmodalEditItens.innerHTML = htmlFormEditBeneficiario;

        this.LoadEventModal();

        $('#ModalEdicao').modal();
      });
  }
  private LoadEventModal() {

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
      //console.log(cont);

      newbenf.innerHTML += `<div class="form-row">
                                      <div class="form-group col-lg-3 col-md-12">
                                          <label for="inputNomeBenf${cont}">Nome beneficiario</label>
                                          <input type="text" class="form-control form-control-sm" id="inputNomeBenf${cont}">
                                      </div>
                                      <div class="form-group col-lg-2 col-md-12">
                                          <label for="inputCPFBenf${cont}">CPF</label>
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
                                          <input type="text" class="form-control form-control-sm" id="inputParentescoBenf${cont}">
                                      </div>
                                      <div class="form-group col-lg-1 col-md-12">
                                          <label for="inputPorcentagemBenf${cont}"> %</label>
                                          <input type="text" class="Percent form-control form-control-sm" id="inputPorcentagemBenf${cont}">
                                      </div>
                                  </div>`;

      this.LoadCamposForm();

    });
  }


  //FORM
  private LoadHtmlForm() {
    let htmlForm: string = `<div class="${styles.paper}">
                    <div>
                      <div class="form-header row justify-content-between">
                        <div class="form-header-logo col-lg-2 col-md-12">
                            <img src="../img/FormResource.jfif" alt="Logo">
                        </div>
                        <div class="form-header-title col-lg-9 col-md-12">
                            <h1 class="Htitle">Termo de Nomeação de Beneficiários Seguro de Vida de Pessoas</h1>
                        </div>
                      </div>
                      <form id="FormularioSVP" name="FormularioSVP">
                          <!-- Segurado -->
                          <fieldset>
                              <legend>Dados do Segurado</legend>
                              <div class="form-row">

                                  <div class="form-group col-md-6">
                                      <label for="inputName">Nome completo</label>
                                      <input type="text" class="form-control form-control-sm" id="inputName" name="inputName" placeholder="Nome completo">
                                  </div>
                                  <div class="form-group col-md-6">
                                      <label for="inputCpf">CPF</label>
                                      <input type="text" class="CPF form-control form-control-sm" id="inputCpf" placeholder="CPF">
                                  </div>
                              </div>
                              <div class="form-row">
                                  <div class="form-group col-md-6">
                                      <label for="inputData">Data de nascimento</label>
                                      <input type="text" class="Date form-control form-control-sm" id="inputData" placeholder="Data de nascimento">
                                  </div>
                                  <div class="form-group col-md-6">
                                      <label for="inputMatricula">Matricula</label>
                                      <input type="text" class="form-control form-control-sm" id="inputMatricula" placeholder="Matricula">
                                  </div>
                              </div>
                          </fieldset>
                          <!-- Empresa -->
                          <fieldset>
                            <legend>Dados da Empresa</legend>
                            <div class="form-row">
                                <div class="form-group col-md-4">
                                    <label for="inputEmpresa">Empresa</label>
                                    <input type="text" class="form-control form-control-sm" id="inputEmpresa" placeholder="Firjan-SENAI">
                                </div>
                                <div class="form-group col-md-4">
                                    <label for="inputEstabelecimento">Estabelecimento</label>
                                    <input type="text" class="form-control form-control-sm" id="inputEstabelecimento">
                                </div>
                                <div class="form-group col-md-4">
                                    <label for="inputLotacao">Lotação</label>
                                    <input type="text" class="form-control form-control-sm" id="inputLotacao">
                                </div>
                            </div>
                          </fieldset>
                          <!-- Termo -->
                          <div class="controler-text">
                              <p><b>Na qualidade de segurado da apólice contratada pela Entidade para seus empregados, nomeio por
                                      este termo que vai por mim assinado, como meus beneficiários, as pessoas abaixo
                                      indicadas:</b></p>
                          </div>
                          <!-- beneficiarios -->
                          <fieldset>
                              <legend>Dados dos Beneficiarios</legend>
                              <div id="BenfSec">
                              <!-- conteudo dinamico -->
                                  <div class="form-row">
                                      <div class="form-group col-lg-3 col-md-12">
                                          <label for="inputNomeBenf1">Nome beneficiario</label>
                                          <input type="text" class="form-control form-control-sm" id="inputNomeBenf1">
                                      </div>
                                      <div class="form-group col-lg-2 col-md-12">
                                          <label for="inputCPFBenf1">CPF</label>
                                          <input type="text" class="CPF form-control form-control-sm" id="inputCPFBenf1">
                                      </div>
                                      <div class="form-group col-lg-2 col-md-12">
                                          <label for="inputDataBenf1">Nascimento</label>
                                          <input type="text" class="Date form-control form-control-sm" id="inputDataBenf1">
                                      </div>
                                      <div class="form-group col-lg-2 col-md-12">
                                          <label for="inputTelefoneBenf1">Telefone</label>
                                          <input type="text" class="Telefone form-control form-control-sm" id="inputTelefoneBenf1">
                                      </div>
                                      <div class="form-group col-lg-2 col-md-12">
                                          <label for="inputParentescoBenf1">Parentesco</label>
                                          <input type="text" class="form-control form-control-sm" id="inputParentescoBenf1">
                                      </div>
                                      <div class="form-group col-lg-1 col-md-12">
                                          <label for="inputPorcentagemBenf1"> %</label>
                                          <input type="text" class="Percent form-control form-control-sm" id="inputPorcentagemBenf1">
                                      </div>
                                  </div>
                                  <!-- conteudo dinamico -->
                              </div>
                              <div class="form-row justify-content-between">
                                <a id="addbenf" href="#" ">+ beneficiario</a>
                              
                              </div>
                          </fieldset>
                          <!-- Avisos -->
                          <fieldset>
                              <legend>Dados Importantes</legend>
                              <ul class="myUl">
                                  <li>Os Titulares do seguro deverão manifestar livremente sua vontade na indicação de seus
                                      beneficiários, podendo indicar qualquer pessoa como beneficiário, e não somente os
                                      dependentes
                                      legais;</li>
                                  <li>Para segurado maior de 16 anos e menor de 18 anos, a assinatura deverá ser em conjunto com
                                      seu
                                      representante legal, e se menor de 16 anos, a assinatura deverá ser somente do seu
                                      representante
                                      legal. Para ambos os casos será necessário o envio de uma cópia do RG e CPF do representante
                                      legal, junto com a certidão de nascimento e/ou documento legal que comprove a
                                      responsabilidade
                                      sobre o menor</li>
                                  <li>Caso o segurado se encontre impossibilitado, ou não saiba assinar, deverá ser colhida sua
                                      impressão digital e a assinatura de um representante (assinatura a rogo). Também deverá ser
                                      encaminhada cópia de um documento de identificação que sirva de comprovação da assinatura do
                                      representante.</li>
                                  <li>Deverão ser preenchidos todos os campos do formulário, inclusive o percentual de
                                      participação de
                                      cada beneficiário;</li>
                                  <li>No preenchimento incorreto ou incompleto do formulário, este não acatado e serão mantidos os
                                      beneficiários indicados anteriormente. Caso ainda não tenham sido indicados, os
                                      beneficiários
                                      serão definidos pela legislação vigente na data do evento;</li>
                                  <li>Na falta de indicação de beneficiário (s), a indenização do seguro será para de acordo com a
                                      legislação vigente
                                  </li>
                                  <li>Em caso de óbito a família deverá informar à GRB - Gerência de Remuneração e Benefícios.
                                  </li>
                              </ul>
                          </fieldset>
                          <!-- Assinatura -->
                          <fieldset>
                              <legend>Assinatura</legend>
                              <div class="form-row">
                                  <div class="form-group col-md-3">
                                      <div>
                                          <label for="inputEstado">Estado</label>
                                          <select id="inputEstado" class="form-control form-control-sm">
                                              <option selected>-</option>
                                              <option>ACRE</option>
                                              <option>PARÁ</option>
                                              <option>RONDÔNIA</option>
                                              <option>RORAIMA</option>
                                              <option>TOCANTINS</option>
                                              <option>MARANHÃO</option>
                                              <option>PARAÍBA</option>
                                              <option>PERNAMBUCO</option>
                                              <option>PIAUÍ</option>
                                              <option>RIO GRANDE DO NORTE</option>
                                              <option>SERGIPE</option>
                                              <option>GOIÁS</option>
                                              <option>MATO GROSSO DO SUL</option>
                                              <option>MATO GROSSO</option>
                                              <option>ESPÍRITO SANTO</option>
                                              <option>MINAS GERAIS</option>
                                              <option>RIO DE JANEIRO</option>
                                              <option>SÃO PAULO</option>
                                              <option>RIO GRANDE DO SUL</option>
                                              <option>SANTA CATARINA</option>
                                              <option>AMAZONAS</option>
                                              <option>AMAPÁ</option>
                                              <option>ALAGOAS</option>
                                              <option>BAHIA</option>
                                              <option>CEARÁ</option>
                                              <option>PARANÁ</option>
                                          </select>
                                      </div>
                                  </div>
                                  <div class="form-group col-md-4" id="signature">
                                      <label for="inputDataAss">Data</label>
                                      <input type="text" class="form-control form-control-sm" id="inputDataAss" readonly>
                                  </div>
                                  <div class="form-group col-md-5">
                                      <label for="inputAss">Assinatura</label>
                                      <buttom type="button" class="BtnAss form-control form-control-sm" id="ActionAss"><buttom>
                                  </div>
                              </div>
                          </fieldset>
                          <buttom type="button" class="btn btn-primary" id="btnSalvar">Concluir e Enviar</buttom>
                      </form>
                      </div>
                   </div>
                  
                  <div class="modal fade" id="ModalUploadAssinatura" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                    <div class="modal-dialog modal-dialog-centered">
                      <div class="modal-content">
                        <div class="modal-header">
                          <h3 class="modal-title" id="staticBackdropLabel" style="width: 100%; text-align: center;color: black;">Cadastro de assinatura eletrônica</h3>
                        </div>
                        <div class="modal-body">
                          <div style="text-align: center; margin: 0 px 20px; color: black; font-size:18px">
                            <p id="NameModal"> </p>
                            <p id="EmailModal"> </p>
                          </div>
                          <div style="text-align: center; color: black; margin-bottom:10px;">
                            <p >Faça o upload da imagem para ser usado como sua assinatura digital<p>
                          </div>
                            
                        <input type="file" id="formFile" style="width: 100%;border: 1px solid #ced4da;border-radius: 0.25rem; color: black;">
                        <label for="formFile" class="form-label" style="font-size: smaller; color: black;">*assinatura deve ser feita em um papel branco com caneta de cor azul ou preta</label>
                      </div>
                    <div class="modal-footer" style="justify-content: center;">
                      <button type="button" class="btn" style="color: #fff; background-color: #dc3545; border-color: #dc3545;" data-bs-dismiss="modal">Fechar</button>
                      <button type="button" class="btn" style="color: #fff; background-color: #003BD1; border-color: #003BD1;" id="BtnCadastrar">Cadastrar</button>
                    </div>
                  </div>
                </div>
              </div>
                          
                   `;

    this.HTMLRenderForm = document.getElementById('RenderForm');
    this.HTMLRenderForm.innerHTML = htmlForm;

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
      this.UploadDados();

    });
    /*BOTAO ADICIONA BENEFICIARIO*/
    let newbenf = document.getElementById('BenfSec');
    let addbenf = document.getElementById('addbenf');
    let cont: number = 1;
    addbenf.addEventListener('click', (e) => {
      cont = cont + 1;
      //console.log(cont);

      newbenf.innerHTML += `<div class="form-row">
                                      <div class="form-group col-lg-3 col-md-12">
                                          <label for="inputNomeBenf${cont}">Nome beneficiario</label>
                                          <input type="text" class="form-control form-control-sm" id="inputNomeBenf${cont}">
                                      </div>
                                      <div class="form-group col-lg-2 col-md-12">
                                          <label for="inputCPFBenf${cont}">CPF</label>
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
                                          <input type="text" class="form-control form-control-sm" id="inputParentescoBenf${cont}">
                                      </div>
                                      <div class="form-group col-lg-1 col-md-12">
                                          <label for="inputPorcentagemBenf${cont}"> %</label>
                                          <input type="text" class="Percent form-control form-control-sm" id="inputPorcentagemBenf${cont}">
                                      </div>
                                  </div>`;

      this.LoadCamposForm();

    });
  }
  private LoadCamposForm() {
    //MASCARAS
    $('.CPF').mask('999.999.999-99');
    $('.Date').mask('00/00/0000');
    $('.Telefone').mask('(00) 00000-0000');
    $('.Percent').mask('##0%', { reverse: true });

    /* Data */
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
  private ValidaCamposForm() {
    //SEGURADO
    let inputNome = (<HTMLInputElement>document.getElementById('inputName'));
    let inputCPF = (<HTMLInputElement>document.getElementById('inputCpf'));
    let inputDataNascimento = (<HTMLInputElement>document.getElementById('inputData'));
    let inputMatricula = (<HTMLInputElement>document.getElementById('inputMatricula'));
    //EMPRESA
    let inputEmpresa = (<HTMLInputElement>document.getElementById('inputEmpresa'));
    let inputEstabelecimento = (<HTMLInputElement>document.getElementById('inputEstabelecimento'));
    let inputLotacao = (<HTMLInputElement>document.getElementById('inputLotacao'));
    //BENEFICIARIOS
    let inputNomeBeneficiario = (<HTMLInputElement>document.getElementById('inputNomeBenf1'));
    let inputCPFBeneficiario = (<HTMLInputElement>document.getElementById('inputCPFBenf1'));
    let inputDataNascimentoBeneficiario = (<HTMLInputElement>document.getElementById('inputDataBenf1'));
    let inputTelefoneBaneficiario = (<HTMLInputElement>document.getElementById('inputTelefoneBenf1'));
    let inputParentescoBeneficiario = (<HTMLInputElement>document.getElementById('inputParentescoBenf1'));
    let inputPorcentagem = (<HTMLInputElement>document.getElementById('inputPorcentagemBenf1'));
    //ESTADO DATA ASSINATURA
    let SelectEstado: HTMLSelectElement = <HTMLSelectElement>document.getElementById('inputEstado');
    let inputDataAss = (<HTMLInputElement>document.getElementById('inputDataAss'));


    try {
      if (inputNome.value == "" || inputCPF.value == "" || inputDataNascimento.value == "" || inputMatricula.value == "" || inputEmpresa.value == "" || inputEstabelecimento.value == "" || inputLotacao.value == "" || inputNomeBeneficiario.value == "" || inputCPFBeneficiario.value == "" || inputDataNascimentoBeneficiario.value == "" || inputTelefoneBaneficiario.value == "" || inputParentescoBeneficiario.value == "" || inputPorcentagem.value == "" || SelectEstado.value == "-" || inputDataAss.value == "") {

        this.ModalError();

      } else {


        this.SalvaDadosSegurado();

      }
    } catch (error) {
      this.ModalAviso();
    }

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
  private SalvaDadosBeneficiarios(SeguradoID: number) {
    //BENEFICIARIOS
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

    this.ModalSucesso();
    let SignatureBtn = (<HTMLButtonElement>document.getElementById('ActionAss'));
    SignatureBtn.innerText = '';
    $("#FormularioSVP").trigger("reset");
    this.render();
  }
  private async UploadDados() {

    let files = (<HTMLInputElement>document.getElementById('formFile')).files;
    let file = files[0];


    var chars = "0123456789" + "ABCDEFGHIJKLMNOPQRSTUVWXYZ" + "abcdefghijklmnopqrstuvwxyz" + "!@#$%&";
    var string_length = 32;
    var randomstring32 = '';
    for (var i = 0; i < string_length; i++) {
      var rnum = Math.floor(Math.random() * chars.length);
      randomstring32 += chars.substring(rnum, rnum + 1);
    }


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

      let web = this.context.pageContext.web.absoluteUrl;

      try {

        //Upload a file to the SharePoint Library
        sp.web.getFolderByServerRelativeUrl(this.context.pageContext.web.serverRelativeUrl + "/SignatureData")
          .files.add(str_data + "_" + str_hora + "_" + file.name, file, true)
          .then((data) => {
            alert("File uploaded sucessfully");
          })
          .catch((error) => {
            alert("Error is uploading");
          });
        // sp.web.getFolderByServerRelativePath("/sites/DEV/SignatureData/").files.addChunked(str_data + "_" + str_hora + "_" + file.name, file)
        // .then((result) => {
        //   console.log(file.name + " upload successfully!");
        //   result.file.listItemAllFields.get().then((listItemAllFields) => {
        //     // get the item id of the file and then update the columns(properties)
        //     sp.web.lists.getByTitle("SignatureData").items.getById(listItemAllFields.Id).update({
        //       NomeUsuario: this.context.pageContext.user.displayName,
        //       Emailusuario: this.context.pageContext.user.email,
        //       HashCode: randomstring32,
        //       FileName: file.name,
        //       //DataHoraUpload: str_data + "_" + str_hora
        //     }).then(r => {
        //       console.log(file.name + " properties updated successfully!");
        //       (<HTMLInputElement>document.getElementById('uploadFile')).value = "";
        //     });
        //   });
        // });
      }
      catch (Exception) {
        console.log(Exception);
      }
    }
  }

  //MODAIS 
  public ModalError() {

    Swal.fire({
      title: 'OPS..!',
      text: 'Existem campos obrigatorios sem preenchimento.',
      icon: 'error',
      confirmButtonText: 'OK',
      confirmButtonColor: "#DD6B55",
    });

  }
  public ModalSucesso() {

    Swal.fire({
      title: 'Tudo Certo!',
      text: 'Seu formulario foi salvo com sucesso!',
      icon: 'success',
      confirmButtonText: 'OK',
      confirmButtonColor: "#32CD32"
    });

  }
  public ModalAviso() {
    Swal.fire({
      title: 'OPS Algo deu Errado!',
      text: 'Tivemos um problema ao submeter seu formulario, preecha e envio novamente.',
      icon: 'warning',
      confirmButtonText: 'OK',
      confirmButtonColor: "#FACEA8",
    });

  }
  public ModalSignatureTrue(HashCode: string) {

    Swal.fire({
      title: 'Aassinar este documento digitalmente',
      showDenyButton: false,
      confirmButtonText: 'Assinar',
      confirmButtonColor: "#003BD1",

    }).then((result) => {

      if (result.isConfirmed) {
        Swal.fire({

          icon: 'success',
          title: 'Documento assinado com sucesso!',
          text: 'submeta-o formulario para concluir',
          showConfirmButton: false,
          timer: 2500
        });
        let SignatureBtn = (<HTMLButtonElement>document.getElementById('ActionAss'));
        SignatureBtn.innerText = HashCode;
        //   } else if (result.isDenied) {
        //     Swal.fire({
        //       // position: 'top-end',
        //       icon: 'error',
        //       title: 'Seu documento nao foi assinado',
        //       showConfirmButton: false,
        //       timer: 1500
        //     })
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
