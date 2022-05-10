import { Version } from '@microsoft/sp-core-library';

import { IPropertyPaneConfiguration, PropertyPaneTextField } from '@microsoft/sp-property-pane';

import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import { AadHttpClient, HttpClientResponse, ISPHttpClientOptions } from '@microsoft/sp-http';

import { escape } from '@microsoft/sp-lodash-subset';

import styles from './FormularioSvpWebPart.module.scss';

import * as strings from 'FormularioSvpWebPartStrings';

import * as $ from 'jquery';

import 'bootstrap';

import { ICadSeguradoListItem, ICadBeneficiarioListItem, IApiSwaggerListItem, IAssinaturaDigitalListItem } from '../../models';

import { CadSeguradoService, CadBeneficiarioService, AssinaturaDigitalService } from '../../service';

import { UserAgentApplication, AuthenticationParameters, Configuration } from "@azure/msal";

require('../../../node_modules/bootstrap/dist/css/bootstrap.min.css');

require('../../styles/formStyles.css');

require('jquery-mask-plugin');

import Swal from 'sweetalert2';

import 'jquery-mask-plugin';

// import { Web } from "sp-pnp-js/lib/pnp";

import { sp, Web } from "@pnp/sp/presets/all";
import pnp, { ConsoleListener } from 'sp-pnp-js';
import { forEach } from 'lodash';
import { data, fn } from 'jquery';

export interface IFormularioSvpWebPartProps {
  description: string;
}

export default class FormularioSvpWebPart extends BaseClientSideWebPart<IFormularioSvpWebPartProps> {

  //INICIO

  /*API EXTERNA */
  private ordersClient: AadHttpClient;
  /*API EXTERNA */

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

    return Promise.resolve();
  }

  //ELEMENTS PAI FORM E TABLE
  private HTMLRenderForm: HTMLElement; /*ID RenderForm*/
  private HTMLRenderTable: HTMLElement; /*ID RenderTable*/

  //ELEMENTS ITENS TABLE
  private HTMLTableItens: HTMLElement; /*ID TableTR*/

  public render(): void {

    let userFake = 'MALCANTARA';
    let User = this.context.pageContext.user.loginName;
    let newUser = User.split('@')[0]

    try {
      const UserName = this.context.pageContext.user.displayName;
      this.ConsultaCadSeguradoService.getCadSegurados(UserName)
        .then((response: ICadSeguradoListItem[]) => {
          if (response && response.length > 0) {

            const htmlTable: string = `<div id="RenderTable"><h1>HTML LISTA DE ITENS<h1></div>`;
            this.domElement.innerHTML = htmlTable;
            this.LoadHtmlTable();

          } else {

            this.GetToken(newUser);
            //const HtmlForm: string = `<div id="RenderForm"> </div>`;
            //this.domElement.innerHTML = HtmlForm;
            // this.LoadHtmlForm();
            // this.LoadEventForm();
            // this.LoadCamposForm();

          }
        });
    } catch (Exception) {
      this.ModalAviso();
    }
  }
  public async GetToken(user: string) {

    const config: Configuration = {
      auth: {
        clientId: '09a83055-95fc-4dfc-adc5-64fb8a6d9228',
        authority: 'https://login.microsoftonline.com/d0c698d4-e4ea-4ee9-a79d-f2d7a78399c8/oauth2/v2.0/authorize',
        redirectUri: 'https://sfirjan.sharepoint.com/sites/DEV/SitePages/Developer.aspx',
      },
      cache: {
        cacheLocation: 'localStorage',
        storeAuthStateInCookie: false
      },
    };

    const params: AuthenticationParameters = {
      authority: 'https://login.microsoftonline.com/d0c698d4-e4ea-4ee9-a79d-f2d7a78399c8',
      scopes: ['api://09a83055-95fc-4dfc-adc5-64fb8a6d9228/Colaborador.Read.All'],
    };

    const myMSAL = new UserAgentApplication(config);
    //console.log(myMSAL);

    try {

      //console.log('Entrou no try');
      const login = await myMSAL.acquireTokenSilent(params);
      //console.log(login.accessToken);
      this._getApiAjax(user, login.accessToken);


    } catch (error) {

      //console.log('entrou no Catch');
      //console.log(error);
      await myMSAL.loginPopup(params);

      const login = await myMSAL.acquireTokenSilent(params);
      //console.log(login.accessToken);
      //return login.accessToken;

    }

  }
  public _getApiAjax(User: string, token: string) {

    //console.log(token);


    $.ajax({
      
      // url: `https://svcdevext.firjan.com.br/recursoshumanos/api/v2/colaboradores/obterporlogin?Login=${User}&IncluirEmpresa=true&IncluirEstabelecimento=true&IncluirItemContabil=false&IncluirCargo=true&Incl
      // uirTurnoTrabalho=false&IncluirTipoContratacao=false&IncluirEstruturaSalarial=false&IncluirLotacao=true&IncluirCentroCusto=false&IncluirLocalFisico=true&IncluirContato=false&IncluirDocumentacao=true&IncluirRemuneracao=false`,

      url: `https://svcdevext.firjan.com.br/recursoshumanos/api/v2/colaboradores/me?IncluirEmpresa=true&IncluirEstabelecimento=true&IncluirItemContabil=false&IncluirCargo=true&Incl
      uirTurnoTrabalho=false&IncluirTipoContratacao=false&IncluirEstruturaSalarial=false&IncluirLotacao=true&IncluirCentroCusto=false&IncluirLocalFisico=true&IncluirContato=false&IncluirDocumentacao=true&IncluirRemuneracao=false`,
      type: 'GET',
      beforeSend: (xhr) => {
        xhr.setRequestHeader('Authorization', 'Bearer ' + token);
      },
      data: {},
      success: (data) => {

        //console.log(data);
        this._SetMyData(data);

      },
      error: (error) => {

        console.error("Erro na consulta a API ");
        console.error(error.responseText);

      },
    });
  }

  private _SetMyData(Data: any) {

    this.LoadHtmlForm();
    this.LoadEventForm();
    this.LoadCamposForm();

    //SEGURADO
    let SetNome = (<HTMLInputElement>document.getElementById('inputName'));
    let SetCPF = (<HTMLInputElement>document.getElementById('inputCpf'));
    let SetDataNascimento = (<HTMLInputElement>document.getElementById('inputData'));
    let SetMatricula = (<HTMLInputElement>document.getElementById('inputMatricula'));
    //EMPRESA
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
  private GetAssinatura() {

    const UserName = this.context.pageContext.user.displayName;
    const UserEmail = this.context.pageContext.user.email;

    this.ConsultaAssinaturaDigitalService.getAssinaturas(UserName, UserEmail)
      .then((Signature: IAssinaturaDigitalListItem[]) => {
        if (Signature && Signature.length > 0) {


          let ChrHash: string = Signature[0].HashCode;
          let NUser: string = Signature[0].NomeUsuario;

          this.ModalSignatureTrue(ChrHash, NUser);



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
                            <th scope="col-3">Opções</th>
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
          //console.log(response);
          if (item.Status === "Aprovado") {
            HtmlItensTable = HtmlItensTable + `
                  <tr id="${item.ID}">
                    <td>Termo de Nomeação de Beneficiários</td>
                    <td>${item.DataAssinatura}</td>
                    <td>${item.Status}</td>
                    <td id="TdOptions${item.ID}">
                      
                      <a href="${newURL}${item.AttachmentFiles[0].ServerRelativeUrl}" target="_blank">
                        <button type="submit" class="VizuBtn" id="VizuBtn${item.ID}">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" class="bi bi-filetype-pdf" viewBox="0 0 16 16">
                            <path fill-rule="evenodd" d="M14 4.5V14a2 2 0 0 1-2 2h-1v-1h1a1 1 0 0 0 1-1V4.5h-2A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v9H2V2a2 2 0 0 1 2-2h5.5L14 4.5ZM1.6 11.85H0v3.999h.791v-1.342h.803c.287 0 .531-.057.732-.173.203-.117.358-.275.463-.474a1.42 1.42 0 0 0 .161-.677c0-.25-.053-.476-.158-.677a1.176 1.176 0 0 0-.46-.477c-.2-.12-.443-.179-.732-.179Zm.545 1.333a.795.795 0 0 1-.085.38.574.574 0 0 1-.238.241.794.794 0 0 1-.375.082H.788V12.48h.66c.218 0 .389.06.512.181.123.122.185.296.185.522Zm1.217-1.333v3.999h1.46c.401 0 .734-.08.998-.237a1.45 1.45 0 0 0 .595-.689c.13-.3.196-.662.196-1.084 0-.42-.065-.778-.196-1.075a1.426 1.426 0 0 0-.589-.68c-.264-.156-.599-.234-1.005-.234H3.362Zm.791.645h.563c.248 0 .45.05.609.152a.89.89 0 0 1 .354.454c.079.201.118.452.118.753a2.3 2.3 0 0 1-.068.592 1.14 1.14 0 0 1-.196.422.8.8 0 0 1-.334.252 1.298 1.298 0 0 1-.483.082h-.563v-2.707Zm3.743 1.763v1.591h-.79V11.85h2.548v.653H7.896v1.117h1.606v.638H7.896Z"/>
                          </svg>
                        </button>
                      </a> 
                    </td>
                  </tr>`;

          } else if (item.Status === "Reprovado") {
            HtmlItensTable = HtmlItensTable + `
                      <tr id="${item.ID}">
                        <td>Termo de Nomeação de Beneficiários</td>
                        <td>${item.DataAssinatura}</td>
                        <td>${item.Status}</td>
                        <td id="TdOptions${item.ID}">
                                              
                          <button type="submit" class="EditBtn" id="EditBtn${item.ID}">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16">
                              <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                              <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>
                            </svg>
                          </button>
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
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" class="bi bi-search" viewBox="0 0 16 16">
                          <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                          </svg>
                        </button>
                        </td>
                      </tr>`;

          }

          this.HTMLTableItens = document.getElementById('TableTR');
          this.HTMLTableItens.innerHTML = HtmlItensTable;
          this.LoadEventTable();
        });
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
  private LoadHtmlForm() {

    let htmlForm: string = `<div class="paper">
                    <div>
                      <div class="form-header row justify-content-between">
                        <div class="form-header-logo col-lg-2 col-md-12">
                            <img src="../SiteAssets/logo-Firjan.png" alt="Logo">
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
                                      <input type="text" class="form-control form-control-sm" id="inputName" name="inputName" placeholder="Nome Completo">
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
                                      <label for="inputMatricula">Matrícula</label>
                                      <input type="text" class="form-control form-control-sm" id="inputMatricula" placeholder="Matrícula">
                                  </div>
                              </div>
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
                              <legend>Dados dos Beneficiários</legend>
                              <div class="form-row justify-content-between">
                                <buttom type="button" class="btn btn-primary" id="addbenf">Adicionar Beneficiários</buttom>
                              </div>
                              <div id="BenfSec">
                                <!-- conteudo dinamico -->
                                    


                                <!-- conteudo dinamico -->
                              </div>
                          </fieldset>
                          <!-- Avisos -->
                          <fieldset>
                              <legend>Dados Importantes</legend>
                              <ul class="myUl">
                                 <li>Os Titulares do seguro deverão manifestar livremente sua vontade na indicação de seus
                                      beneficiários, podendo indicar qualquer pessoa como beneficiário, e não somente os
                                      dependentes legais, conforme legislação aplicável;
                                      </li>
                                  <li>Para segurado maior de 16 anos e menor de 18 anos, a assinatura deverá ser em conjunto com
                                      seu representante legal, e se menor de 16 anos, até o limite de 14 anos, a assinatura deverá ser somente do seu
                                      representante legal. Para ambos os casos será necessário o envio de uma cópia do RG e CPF do representante
                                      legal, junto com a certidão de nascimento e/ou documento legal que comprove a responsabilidade
                                      sobre o menor</li>
                                  <li>Caso o segurado se encontre impossibilitado, ou não saiba assinar, deverá ser colhida sua
                                      impressão digital e a assinatura de um representante (assinatura a rogo). é recomendado o reconhecimento de firma do representante e de duas testemunhas. Se o proponente for analfabeto ou legalmente incapaz aceitaremos com devido reconhecimento de firma, outra impossibilidade não daria causa a mudança de beneficiários.
                                      Também deverá ser
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
                                  <li>Concordo e reconheço como válida a anuência aos termos ora acordados em formato eletrônico, ainda que eu não utilize de certificado digital emitido no padrão ICP-Brasil, admitindo-o como válido para todos os fins, nos termos da Medida Provisória nº 2.200-2/2001. Declaro para todos os fins, que esta formalização eletrônica é suficiente para a comprovação da minha autoria, integridade, validade e vinculação ao presente instrumento.</li>
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
                                              <option>Acre (AC)</option>
                                              <option>Alagoas (AL)</option>
                                              <option>Amapá (AP)</option>
                                              <option>Amazonas (AM)</option>
                                              <option>Bahia (BA)</option>
                                              <option>Ceará (CE)</option>
                                              <option>Distrito Federal (DF)</option>
                                              <option>Espírito Santo (ES)</option>
                                              <option>Goiás (GO)</option>
                                              <option>Maranhão (MA)</option>
                                              <option>Mato Grosso (MT)</option>
                                              <option>Mato Grosso do Sul (MS)</option>
                                              <option>Minas Gerais (MG)</option>
                                              <option>Pará (PA)</option>
                                              <option>Paraíba (PB)</option>
                                              <option>Paraná (PR)</option>
                                              <option>Pernambuco (PE)</option>
                                              <option>Piauí (PI)</option>
                                              <option>Rio de Janeiro (RJ)</option>
                                              <option>Rio Grande do Norte (RN)</option>
                                              <option>Rio Grande do Sul (RS)</option>
                                              <option>Rondônia (RO)</option>
                                              <option>Roraima (RR)</option>
                                              <option>Santa Catarina (SC)</option>
                                              <option>São Paulo (SP)</option>
                                              <option>Sergipe (SE)</option>
                                              <option>Tocantins (TO)</option>
                                          </select>
                                      </div>
                                  </div>
                                  <div class="form-group col-md-3" id="signature">
                                      <label for="inputDataAss">Data</label>
                                      <input type="text" class="form-control form-control-sm" id="inputDataAss" readonly>
                                  </div>
                                  <div class="form-group col-md-6">
                                      <label for="inputAss">Assinatura</label>
                                      <buttom type="button" class="BtnAss form-control form-control-sm" id="ActionAss"></buttom>
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
                     
                      <button type="button" class="btn" style="color: #fff; background-color: #003BD1; border-color: #003BD1;" id="BtnCadastrar">Cadastrar</button>
                    </div>
                  </div>
                </div>
              </div>
                          
                   `;

    this.domElement.innerHTML = htmlForm;

    // this.HTMLRenderForm = document.getElementById('RenderForm');
    // this.HTMLRenderForm.innerHTML = htmlForm;

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

      htmlbenf = `<div class="form-row itemGlo">
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
                                              <option>Outros</option>
                                          </select>
                              </div>
                              <div class="form-group col-lg-1 col-md-12">
                                  <label for="inputPorcentagemBenf${cont}"> %</label>
                                  <input type="text" class="Percent form-control form-control-sm" id="inputPorcentagemBenf${cont}">
                              </div>
                            </div>`;

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
          alert('O valor maximo permitido 100% !');

          $('.Percent').val('');
        }
      }
    });


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

        this.ModalError();

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

            let valPor = parseInt(inputPorcentagem.split('%')[0])
            somaP = somaP + valPor;


            if (inputNomeBeneficiario == "" || inputCPFBeneficiario == "" || inputDataNascimentoBeneficiario == "" || inputTelefoneBaneficiario == "" || inputParentescoBeneficiario == "-" || inputPorcentagem == "") {

              this.ModalError();

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

            this.ModalError();

          } else {

            if (valPor > 100 || valPor < 100) {

              alert('A pocentagem deve ser igual a 100%')
              $('.Percent').val('');


            } else {

              this.SalvaDadosSegurado();

            }
          }
        }
      }
    } catch (error) {
      this.ModalAviso();
    }
  }


  //MODAL EDICAO 
  private LoadHtmlModalForm(ID: number) {

    let htmlFormEditSegurado: string = "";

    this.ConsultaCadSeguradoService.getCadSegurado(ID)
      .then((Segurado: ICadSeguradoListItem) => {

        let stat = Segurado.Status;

        if (stat === "Pendente") {
          /**COM O DISABLED */
          htmlFormEditSegurado = `<div class="paper" >
                    <div>
                      <div class="form-header row justify-content-between">
                        <div class="form-header-logo col-lg-2 col-md-12">
                            <img src="../SiteAssets/logo-Firjan.png" alt="Logo">
                        </div>
                        <div class="form-header-title col-lg-9 col-md-12">
                            <h1 class="Htitle">Termo de Nomeação de Beneficiários Seguro de Vida de Pessoas</h1>
                        </div>
                      </div>
                      <form id="FormularioSVP" name="FormularioSVP">
                          <!-- Segurado -->
                          <fieldset>
                              <legend>Dados do Segurado</legend>
                              <div class="form-row global" id="Global${Segurado.ID}">

                                  <div class="form-group col-md-6">
                                      <label for="inputName">Nome completo</label>
                                      <input type="text" class="form-control form-control-sm" id="inputName" name="inputName" value="${Segurado.Nome}" disabled>
                                  </div>
                                  <div class="form-group col-md-6">
                                      <label for="inputCpf">CPF</label>
                                      <input type="text" class="CPF form-control form-control-sm" id="inputCpf" value="${Segurado.CPF}" disabled>
                                  </div>
                              </div>
                              <div class="form-row">
                                  <div class="form-group col-md-6">
                                      <label for="inputData">Data de nascimento</label>
                                      <input type="text" class="Date form-control form-control-sm" id="inputData" value="${Segurado.DataNascimento}" disabled>
                                  </div>
                                  <div class="form-group col-md-6">
                                      <label for="inputMatricula">Matrícula</label>
                                      <input type="text" class="form-control form-control-sm" id="inputMatricula" value="${Segurado.Matricula}" disabled>
                                  </div>
                              </div>
                              <div class="form-row">
                                <div class="form-group col-md-4">
                                    <label for="inputEmpresa">Empresa</label>
                                    <input type="text" class="form-control form-control-sm" id="inputEmpresa" placeholder="Firjan-SENAI"value="${Segurado.Empresa}" disabled >
                                </div>
                                <div class="form-group col-md-4">
                                    <label for="inputEstabelecimento">Estabelecimento</label>
                                    <input type="text" class="form-control form-control-sm" id="inputEstabelecimento" value="${Segurado.Estabelecimento}" disabled>
                                </div>
                                <div class="form-group col-md-4">
                                    <label for="inputLotacao">Lotação</label>
                                    <input type="text" class="form-control form-control-sm" id="inputLotacao" value="${Segurado.Lotacao}" disabled >
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
                          </fieldset>
                          <!-- Avisos -->
                          <fieldset>
                              <legend>Dados Importantes</legend>
                              <ul class="myUl">
                                  <li>Os Titulares do seguro deverão manifestar livremente sua vontade na indicação de seus
                                      beneficiários, podendo indicar qualquer pessoa como beneficiário, e não somente os
                                      dependentes legais, conforme legislação aplicável;
                                      </li>
                                  <li>Para segurado maior de 16 anos e menor de 18 anos, a assinatura deverá ser em conjunto com
                                      seu representante legal, e se menor de 16 anos, até o limite de 14 anos, a assinatura deverá ser somente do seu
                                      representante legal. Para ambos os casos será necessário o envio de uma cópia do RG e CPF do representante
                                      legal, junto com a certidão de nascimento e/ou documento legal que comprove a responsabilidade
                                      sobre o menor</li>
                                  <li>Caso o segurado se encontre impossibilitado, ou não saiba assinar, deverá ser colhida sua
                                      impressão digital e a assinatura de um representante (assinatura a rogo). é recomendado o reconhecimento de firma do representante e de duas testemunhas. Se o proponente for analfabeto ou legalmente incapaz aceitaremos com devido reconhecimento de firma, outra impossibilidade não daria causa a mudança de beneficiários.
                                      Também deverá ser
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
                                  <li>Concordo e reconheço como válida a anuência aos termos ora acordados em formato eletrônico, ainda que eu não utilize de certificado digital emitido no padrão ICP-Brasil, admitindo-o como válido para todos os fins, nos termos da Medida Provisória nº 2.200-2/2001. Declaro para todos os fins, que esta formalização eletrônica é suficiente para a comprovação da minha autoria, integridade, validade e vinculação ao presente instrumento.</li>
                              </ul>
                          </fieldset>
                          <!-- Assinatura -->
                          <fieldset>
                              <legend>Assinatura</legend>
                              <div class="form-row">
                                  <div class="form-group col-md-3">
                                      <div>
                                          <label for="inputEstado">Estado</label>
                                          <select id="inputEstado" class="form-control form-control-sm" disabled>
                                              <option selected>${Segurado.Estado}</option>

                                          </select>
                                      </div>
                                  </div>
                                  <div class="form-group col-md-3" id="signature">
                                      <label for="inputDataAss">Data</label>
                                      <input type="text" class="form-control form-control-sm" id="inputDataAss" value="${Segurado.DataAssinatura}" disabled>
                                  </div>
                                  <div class="form-group col-md-6">
                                      <label for="inputAss">Assinatura</label>
                                      <buttom type="button" class="BtnAss form-control form-control-sm" id="ActionAss1set" style="background-color: #e9ecef;" disabled>${Segurado.Assinatura}<buttom>
                                  </div>
                              </div>
                          </fieldset>
                      </form>
                      </div>
                   </div>`;

          let btnSalvaAlteracoes = (<HTMLButtonElement>document.getElementById('SalvarAlteracoes'));
          btnSalvaAlteracoes.style.display = "none";

        } else {
          /**SEM O DISABLED */
          htmlFormEditSegurado = `<div class="paper">
                    <div>
                      <div class="form-header row justify-content-between">
                        <div class="form-header-logo col-lg-2 col-md-12">
                            <img src="../SiteAssets/logo-Firjan.png" alt="Logo">
                        </div>
                        <div class="form-header-title col-lg-9 col-md-12">
                            <h1 class="Htitle">Termo de Nomeação de Beneficiários Seguro de Vida de Pessoas</h1>
                        </div>
                      </div>
                      <form id="FormularioSVP"  name="FormularioSVP">
                          <!-- Segurado -->
                          <fieldset>
                              <legend>Dados do Segurado</legend>
                              <div class="form-row global" id="Global${Segurado.ID}" >

                                  <div class="form-group col-md-6">
                                      <label for="inputName">Nome completo</label>
                                      <input type="text" class="form-control form-control-sm" id="inputName" name="inputName" value="${Segurado.Nome}" disabled>
                                  </div>
                                  <div class="form-group col-md-6">
                                      <label for="inputCpf">CPF</label>
                                      <input type="text" class="CPF form-control form-control-sm" id="inputCpf" value="${Segurado.CPF}" disabled>
                                  </div>
                              </div>
                              <div class="form-row">
                                  <div class="form-group col-md-6">
                                      <label for="inputData">Data de nascimento</label>
                                      <input type="text" class="Date form-control form-control-sm" id="inputData" value="${Segurado.DataNascimento}" disabled>
                                  </div>
                                  <div class="form-group col-md-6">
                                      <label for="inputMatricula">Matrícula</label>
                                      <input type="text" class="form-control form-control-sm" id="inputMatricula" value="${Segurado.Matricula}" disabled>
                                  </div>
                              </div>
                              <div class="form-row">
                                <div class="form-group col-md-4">
                                    <label for="inputEmpresa">Empresa</label>
                                    <input type="text" class="form-control form-control-sm" id="inputEmpresa" placeholder="Firjan-SENAI"value="${Segurado.Empresa}" disabled>
                                </div>
                                <div class="form-group col-md-4">
                                    <label for="inputEstabelecimento">Estabelecimento</label>
                                    <input type="text" class="form-control form-control-sm" id="inputEstabelecimento" value="${Segurado.Estabelecimento}" disabled>
                                </div>
                                <div class="form-group col-md-4">
                                    <label for="inputLotacao">Lotação</label>
                                    <input type="text" class="form-control form-control-sm" id="inputLotacao" value="${Segurado.Lotacao}"  disabled>
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
                          </fieldset>
                          <!-- Avisos -->
                          <fieldset>
                              <legend>Dados Importantes</legend>
                              <ul class="myUl">
                                  <li>Os Titulares do seguro deverão manifestar livremente sua vontade na indicação de seus
                                      beneficiários, podendo indicar qualquer pessoa como beneficiário, e não somente os
                                      dependentes legais, conforme legislação aplicável;
                                      </li>
                                  <li>Para segurado maior de 16 anos e menor de 18 anos, a assinatura deverá ser em conjunto com
                                      seu representante legal, e se menor de 16 anos, até o limite de 14 anos, a assinatura deverá ser somente do seu
                                      representante legal. Para ambos os casos será necessário o envio de uma cópia do RG e CPF do representante
                                      legal, junto com a certidão de nascimento e/ou documento legal que comprove a responsabilidade
                                      sobre o menor</li>
                                  <li>Caso o segurado se encontre impossibilitado, ou não saiba assinar, deverá ser colhida sua
                                      impressão digital e a assinatura de um representante (assinatura a rogo). é recomendado o reconhecimento de firma do representante e de duas testemunhas. Se o proponente for analfabeto ou legalmente incapaz aceitaremos com devido reconhecimento de firma, outra impossibilidade não daria causa a mudança de beneficiários.
                                      Também deverá ser
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
                                  <li>Concordo e reconheço como válida a anuência aos termos ora acordados em formato eletrônico, ainda que eu não utilize de certificado digital emitido no padrão ICP-Brasil, admitindo-o como válido para todos os fins, nos termos da Medida Provisória nº 2.200-2/2001. Declaro para todos os fins, que esta formalização eletrônica é suficiente para a comprovação da minha autoria, integridade, validade e vinculação ao presente instrumento.</li>
                              </ul>
                          </fieldset>
                          <!-- Assinatura -->
                          <fieldset>
                              <legend>Assinatura</legend>
                              <div class="form-row">
                                  <div class="form-group col-md-3">
                                      <div>
                                          <label for="inputEstado">Estado</label>
                                          <select id="inputEstado" class="form-control form-control-sm"  >
                                              <option selected>${Segurado.Estado}</option>
                                              <option>Acre (AC)</option>
                                              <option>Alagoas (AL)</option>
                                              <option>Amapá (AP)</option>
                                              <option>Amazonas (AM)</option>
                                              <option>Bahia (BA)</option>
                                              <option>Ceará (CE)</option>
                                              <option>Distrito Federal (DF)</option>
                                              <option>Espírito Santo (ES)</option>
                                              <option>Goiás (GO)</option>
                                              <option>Maranhão (MA)</option>
                                              <option>Mato Grosso (MT)</option>
                                              <option>Mato Grosso do Sul (MS)</option>
                                              <option>Minas Gerais (MG)</option>
                                              <option>Pará (PA)</option>
                                              <option>Paraíba (PB)</option>
                                              <option>Paraná (PR)</option>
                                              <option>Pernambuco (PE)</option>
                                              <option>Piauí (PI)</option>
                                              <option>Rio de Janeiro (RJ)</option>
                                              <option>Rio Grande do Norte (RN)</option>
                                              <option>Rio Grande do Sul (RS)</option>
                                              <option>Rondônia (RO)</option>
                                              <option>Roraima (RR)</option>
                                              <option>Santa Catarina (SC)</option>
                                              <option>São Paulo (SP)</option>
                                              <option>Sergipe (SE)</option>
                                              <option>Tocantins (TO)</option>
                                          </select>
                                      </div>
                                  </div>
                                  <div class="form-group col-md-3" id="signature">
                                      <label for="inputDataAss">Data</label>
                                      <input type="text" class="form-control form-control-sm" id="inputDataAss" value="${Segurado.DataAssinatura}" disabled>
                                  </div>
                                  <div class="form-group col-md-6">
                                      <label for="inputAss">Assinatura</label>
                                      <buttom type="button" class="BtnAss form-control form-control-sm" id="ActionAss1set" disabled>${Segurado.Assinatura}<buttom>
                                  </div>
                                  
                              </div>
                          </fieldset>
                      </form>
                      </div>
                   </div>`;
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

      this.ModalSucesso();
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

      this.ModalSucesso();
      let SignatureBtn = (<HTMLButtonElement>document.getElementById('ActionAss'));
      SignatureBtn.innerText = '';
      $("#FormularioSVP").trigger("reset");
      this.render();
    }
  }
  private async UploadDadosAssinatura() {

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

      let spOpts: ISPHttpClientOptions = {
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        body: file,

      };

      const web = Web(this.context.pageContext.web.absoluteUrl);

      const payload = {
        NomeUsuario: this.context.pageContext.user.displayName,
        EmailUsuario: this.context.pageContext.user.email,
        HashCode: randomstring32,
      };

      {

        // large upload
        web.getFolderByServerRelativeUrl("/sites/DEV/SignatureData/").files.addChunked(str_data + "_" + str_hora + "_" + file.name, file, data => {

          //console.log({ data: data, message: "progress" });
          let myNumber: number = parseInt(((data.currentPointer / data.fileSize) * 100).toString());
          myNumber.toFixed();
          //console.log(`mynumber =` + myNumber);
          //console.log(((data.currentPointer / data.fileSize) * 100).toString());

        }, true)

          .then(result => {

            //console.log(file.name + " upload successfully!");

            result.file.listItemAllFields.get().then((listItemAllFields) => {
              web.lists.getByTitle("SignatureData").items.getById(listItemAllFields.ID).update({

                NomeUsuario: this.context.pageContext.user.displayName,
                EmailUsuario: this.context.pageContext.user.email,
                HashCode: randomstring32,
                //FileName: file.name,

              }).then(r => {
                //console.log(file.name + " properties updated successfully!");
                (<HTMLInputElement>document.getElementById('formFile')).value = "";
                this.GetAssinatura();

              });
            });
          });

        $('#ModalUploadAssinatura').modal('hide');
        this.ModalSucessoAssinatura();


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
  public ModalSignatureTrue(HashCode: string, nome: string) {

    Swal.fire({
      title: 'Assinar este documento digitalmente',
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
        SignatureBtn.innerText = `${nome} : ${HashCode}`;

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
  public ModalSucessoAssinatura() {

    Swal.fire({
      title: 'Assinatura salva com sucesso!',
      text: ' Assine o documento para continuar',
      icon: 'success',
      confirmButtonText: 'OK',
      confirmButtonColor: "#32CD32"
    });

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
