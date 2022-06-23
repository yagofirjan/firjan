import 'bootstrap';
import { SPHttpClient } from '@microsoft/sp-http';
import * as $ from 'jquery';
import styles from '../webparts/formularioSvp/FormularioSvpWebPart.module.scss';
require('../../node_modules/bootstrap/dist/css/bootstrap.min.css');

export class TableFormularioComponent {
    constructor(private siteAbsoluteUrl: string, private client: SPHttpClient) { }
    private Title: string = "Formulário Seguro de Vida de Pessoas";

    public htmlTable() {
        let htmlTable: string = `<button type="button" class="btn btn-primary fa-solid fa-plus" id="NewSolicitacao">Nova Solicitação</button>
        <br />
        <br />
        <div class="ContInput">
            <input id="myInput" type="text" autocomplete="off" placeholder="Insira sua busca aqui..." />
        </div>
        <div class="table-responsive" style="min-width: 900px;">
            <table class="table table-hover">
                <thead class="thead-blue">
                    <tr>
                        <th scope="col-3">Formulário</th>
                        <th scope="col-3">Data Assinatura</th>
                        <th scope="col-3">Status</th>
                        <th scope="col-3">Opções</th>
                    </tr>
                </thead>
                <tbody id="TableTR"></tbody>
            </table>
        </div>
        <!-- Modal Edicao -->
        <div class="modal fade" id="ModalEdicao" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true" style="justify-content: center; align-items: center;">
            <div class="modal-dialog" style="max-width: 1000px;" role="document">
                <div class="modal-content">
                    <div class="modal-body" style="max-width: 1000px;">
                        <div id="ConteudoModalEdicao"></div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">Voltar</button>
                        <button type="button" class="btn btn-primary" id="SalvarAlteracoes">Salvar Alterações</button>
                    </div>
                </div>
            </div>
        </div>`;
        return htmlTable;


    }


    public NhtmlTablePopuladoReprovado(AuxItem: any, DataDepend: any, url: string) {
        let arr: any = AuxItem.AttachmentFiles;
        let htmlTable: string = "";
        let depend: string = "";
        let anexo: string = "";

        if (AuxItem.Ramal == null || AuxItem.Ramal == "null")
            AuxItem.Ramal = "";

        for (var i = 0; i < DataDepend.length; i++) {
            if(DataDepend[i].grauDependencia == 1){
                if(DataDepend[i].nomeDependente == AuxItem.NomeDependente){
                    depend += `<option value = "${DataDepend[i].nomeDependente}" selected>${DataDepend[i].nomeDependente}</option>`;
                }else{
                    depend += `<option value = "${DataDepend[i].nomeDependente}">${DataDepend[i].nomeDependente}</option>`;
                }
            }
        }

        for (var s = 0; s < arr.length; s++) {
            var nome = arr[s].ServerRelativeUrl.split("Attachments")[1].split("/")[2];
            anexo += `<div class="myli" style="margin-right: 5px;padding-right: 12px;">
                      <a href="javascript:void(0)" onclick="window.open('${url}${arr[s].ServerRelativeUrl}');">${nome}
                      </a>
                      </div>`;
        }

        htmlTable = `<div class="paper">
        <div class="form-header row justify-content-between">
            <div class="form-header-logo col-lg-2 col-md-12">
                <img src="../SiteAssets/logo-Firjan.png" alt="Logo">
            </div>
            <div class="form-header-title col-lg-9 col-md-12">
                <h1 class="Htitle">Formulário de Requerimento de
                    Auxílio Creche / Auxílio Dependente PCD</h1>
            </div>
        </div>
        <form id="FormularioSVP" name="FormularioSVP">
            <!-- Segurado -->
            <fieldset>
                <legend>Dados Pessoais</legend>
                <div class="form-row">
                <div class="form-group col-md-6 divIdEmpresa" id="divIdEmpresa">
                    <label for="InputDescEmpresa">Empresa</label>
                    <input type="text" class="form-control form-control-sm" value="${AuxItem.DescEmpresa}" id="InputDescEmpresa" placeholder="Empresa" disabled />
                </div>
                <div class="form-group col-md-6 divIdEstabelecimento" id="divIdEstabelecimento">
                    <label for="InputDescEst">Estabelecimento</label>
                    <input type="text" class="form-control form-control-sm"  value="${AuxItem.DescEstabelecimento}" id="InputDescEst" placeholder="Estabelecimento" disabled/>
                </div>
                </div>
                <div class="form-row">
                    <div class="form-group col-md-3">
                        <label for="inputMatricula">Matrícula</label>
                        <input type="text" class="CPF form-control form-control-sm" id="inputMatricula" value = "${AuxItem.Matricula}"
                            placeholder="${AuxItem.Matricula}" disabled>
                    </div>
                    <div class="form-group col-md-9">
                        <label for="inputName">Nome Completo</label>
                        <input type="text" class="form-control form-control-sm" id="inputName" name="inputName" value = "${AuxItem.NomeCompleto}"
                            placeholder="${AuxItem.NomeCompleto}" disabled>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group col-md-6">
                        <label for="inputLotacao">Lotação </label>
                        <input type="text" class="form-control form-control-sm" id="inputLotacao" value = "${AuxItem.Lotacao}"
                            placeholder="${AuxItem.Lotacao}" disabled>
                    </div>
                    <div class="form-group col-md-6">
                        <label for="inputGargo">Cargo</label>
                        <input type="text" class="form-control form-control-sm" id="inputCargo" value = "${AuxItem.CargoDep}" placeholder="${AuxItem.CargoDep}" disabled>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group col-md-6">
                        <label for="inputTelefone">Telefone</label>
                        <input type="text" class="Date form-control form-control-sm" id="inputTelefone"
                            placeholder="(__) _____.____" value = "${AuxItem.Telefone}">
                    </div>
                    <div class="form-group col-md-6">
                        <label for="inputRamal">Ramal</label>
                        <input type="text" class="form-control form-control-sm" maxlength="5" id="inputRamal" placeholder="Ramal" value = "${AuxItem.Ramal}">
                    </div>
                </div>
            </fieldset>
            <fieldset>
                <div class="form-row">
                    <p><b>Confirmo ter cumprido todos os requisitos exigidos, e venho por meio deste requerer o
                            benefício
                            selecionado abaixo:</b></p>
                </div>
                <div class="form-row">
                <div class="form-group">
                    <input type="checkbox" id="AuxilioCreche" name="AuxilioCreche" />
                    <label for="scales">Auxílio Creche</label>
                </div>
                <div class="form-group">
                    <input type="checkbox" id="AuxilioPCD" name="AuxilioPCD" />
                    <label for="horns">Auxílio para Dependente PCD - Pessoa com Deficiência </label>
                </div>
            </div>
            </fieldset>
            <fieldset>
                <div class="form-row">
                <div class="form-group col-md-12">
                    <label for="inputTelefone">Nome do dependente</label>
                    <select name = "dropdown" class="Date form-control form-control-sm" id="inputNomeDependente" placeholder="Nome do dependete">
                        <option value = ""></option>
                        ${depend}
                    </select>
                </div>
            </div>
                <div class="form-row">
                    <div class="form-group col-md-12">
                        <p><b>Documentos Comprobatórios (Obrigatório anexar ao formulário)</b><br>
                            <b>-Item 4.4.2.1 da NA-035/GG – Auxílio Creche</b><br>
                            <b>-Item 4.5.1.1 da NA-035/GG – Auxílio para Dependente PCD - Pessoa com Deficiência</b></p>
                    </div>
                </div>
                <div class="form-row" id ="anexosAuxCreche">  
                    <div class="form-group col-md-12">
                        <input type="file" name="InputFileDocs" id="InputFileDocs" multiple>
                            <div id="fileList" class="file-list" id"anexosDivAuxCreche">
                            ${anexo} 
                            </div>       
                    </div>
                </div>
            </fieldset>
            <!-- Assinatura -->
            <fieldset>
                <legend>Assinatura</legend>
                <div class="form-row">
                    <div class="form-group col-md-4">
                    <div>
                    <label for="inputEstado">Estado</label>
                    <select id="inputEstado" class="form-control form-control-sm">
                        <option selected>${AuxItem.Estado}</option>
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
                        <input type="text" class="form-control form-control-sm" id="inputDataAss" readonly value = "${AuxItem.Data}"placeholder="${AuxItem.Data}">
                    </div>
                    <div class="form-group col-md-5">
                        <label for="inputAss">Assinatura</label>
                        <buttom type="button" class="BtnAss form-control form-control-sm" id="ActionAss"></buttom>
                    </div>
                </div>
            </fieldset>
            
        </form>
    </div>`;
        return htmlTable;
    }


    public htmlTablePopuladoPendente(Segurado: any, Beneficiario: any){
        
        let depend: string = "";
        for (var i = 0; i < Beneficiario.length; i++) {
                var dinamico = this.htmlTableBeneficiariosPendente(Beneficiario[i]);
                depend += dinamico;

        }
        
        let htmlbenf = `<div class="paper" >
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
                    ${depend}
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

                return htmlbenf;
    }

    public htmlTableBeneficiariosPendente(DataDepend: any) {

        let htmlForm: string = `<div class="form-row itemGlo" id="divPai_${DataDepend.ID}">
        <div class="form-group col-lg-3 col-md-12" >
            <label for="inputNomeBenf${DataDepend.ID}">Nome beneficiario</label>
            <input type="text" class="form-control form-control-sm" id="inputNomeBenf${DataDepend.ID}" value="${DataDepend.Nome}" disabled>
        </div>
        <div class="form-group col-lg-2 col-md-12" >
            <label for="inputCPFBenf${DataDepend.ID}">CPF</label>
            <input type="text" class="CPF  form-control form-control-sm" id="inputCPFBenf${DataDepend.codDependente}" value="${DataDepend.CPF}" disabled>
        </div>
        <div class="form-group col-lg-2 col-md-12">
            <label for="inputDataBenf${DataDepend.ID}">Nascimento</label>
            <input type="text" class="Date form-control form-control-sm" id="inputDataBenf${DataDepend.ID}" value="${DataDepend.DataNascimento}" disabled>
        </div>
        <div class="form-group col-lg-2 col-md-12" >
            <label for="inputParentescoBenf${DataDepend.ID}">Parentesco</label>
            <input type="text" class="GrauParentesco form-control form-control-sm" id="inputParentescoBenf${DataDepend.ID}" value="${DataDepend.Parentesco}" disabled>
        </div>
        <div class="form-group col-lg-2 col-md-12" >
        <label for="inputTelefoneBenf${DataDepend.ID}">Telefone</label>
        <input type="text" class="Telefone form-control form-control-sm" id="inputTelefoneBenf${DataDepend.ID}" value="${DataDepend.Telefone}" disabled>
        </div>
        <div class="form-group col-lg-1 col-md-12">
            <label for="inputPorcentagemBenf${DataDepend.ID}"> %</label>
            <input type="text" class="Percent form-control form-control-sm" id="inputPorcentagemBenf${DataDepend.ID}" value="${DataDepend.Porcentagem}" disabled>
        </div>
      </div>
    `;

        return htmlForm;
    }

    public htmlTablePopuladoReprovado(Segurado: any){

        let htmlbenf = `<div class="paper">
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

                return htmlbenf;
    }

    public htmlTableBeneficiariosReprovado(DataDepend: any) {

               let htmlForm: string = `<div class="form-row itemGlo" id="divPai_${DataDepend.ID}">
        <div class="form-group col-md-1" style="width: 28.499999995%; flex: 0 0 28.499%;max-width: 28.499%;">
            <label for="inputNomeBenf${DataDepend.ID}">Nome beneficiario</label>
            <input type="text" class="form-control form-control-sm" id="inputNomeBenf${DataDepend.ID}" value="${DataDepend.nomeDependente}" disabled>
        </div>
        <div class="form-group col-md-1" style="width: 12.499999995%; flex: 0 0 12.499%;max-width: 12.499%;">
            <label for="inputCPFBenf${DataDepend.ID}">CPF</label>
            <input type="text" class="CPF  form-control form-control-sm" id="inputCPFBenf${DataDepend.codDependente}" value="${DataDepend.CPF}" disabled>
        </div>
        <div class="form-group col-md-1" style="width: 11.499999995%; flex: 0 0 11.499%;max-width: 11.499%;">
            <label for="inputDataBenf${DataDepend.ID}">Nascimento</label>
            <input type="text" class="Date form-control form-control-sm" id="inputDataBenf${DataDepend.ID}" value="${DataDepend.DataNascimento}" disabled>
        </div>
        <div class="form-group col-lg-2 col-md-12" >
            <label for="inputParentescoBenf${DataDepend.ID}">Parentesco</label>
            <input type="text" class="GrauParentesco form-control form-control-sm" id="inputParentescoBenf${DataDepend.ID}" value="${DataDepend.Parentesco}" disabled>
        </div>
        <div class="form-group col-lg-2 col-md-12" >
        <label for="inputTelefoneBenf${DataDepend.ID}">Telefone</label>
        <input type="text" class="Telefone form-control form-control-sm" id="inputTelefoneBenf${DataDepend.ID}" value="${DataDepend.Telefone}" disabled>
        </div>
        <div class="form-group col-lg-1 col-md-12">
            <label for="inputPorcentagemBenf${DataDepend.ID}"> %</label>
            <input type="text" class="Percent form-control form-control-sm" id="inputPorcentagemBenf${DataDepend.ID}" value="${DataDepend.Porcentagem}" disabled>
        </div>
      </div>
    `;

        return htmlForm;
    }

    public htmlTableInit(item: any, newURL: string){

        let HtmlItensTable: string = "";
        let pendencia: number = 0;

        if (item.Status == "Pendente") {
            pendencia += 1;
            HtmlItensTable += `<tr id="VR${item.ID}">
                              <td class="${styles.tbtd}">${this.Title}</td>
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
                              <td class="${styles.tbtd}">${this.Title}</td>
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
                            <td class="${styles.tbtd}">${this.Title}</td>
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

     return [ HtmlItensTable, pendencia ];
    }
}
