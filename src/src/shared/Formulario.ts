import 'bootstrap';
import { SPHttpClient } from '@microsoft/sp-http';
import styles from '../webparts/formularioSvp/FormularioSvpWebPart.module.scss';
require('../../node_modules/bootstrap/dist/css/bootstrap.min.css');

export class FormularioComponent {
    constructor(private siteAbsoluteUrl: string, private client: SPHttpClient) { }


    public htmlForm(Data: any, DataDepend: any) {

        let fD = Data.dataNascimento.split("T")[0].split("-"); 

        let depend: string = "";
        for (var i = 0; i < DataDepend.length; i++) {
                var dinamico = this.htmlFormSegurado(DataDepend[i]);
                depend += dinamico;

        }
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
                      <div class="form-group col-md-6 divNome" id="divNome_${Data.login}">
                          <label for="inputName">Nome completo</label>
                          <input type="text" class="form-control form-control-sm" id="inputName" name="inputName" value="${Data.nome}" placeholder="Nome Completo" disabled>
                      </div>
                      <div class="form-group col-md-6">
                          <label for="inputCpf">CPF</label>
                          <input type="text" class="CPF form-control form-control-sm" id="inputCpf" value="${Data.documentacao.cpf}" placeholder="CPF" disabled>
                      </div>
                  </div>
                  <div class="form-row">
                      <div class="form-group col-md-3">
                          <label for="inputData">Data de nascimento</label>
                          <input type="text" class="Date form-control form-control-sm" id="inputData" value="${fD[2] + "/" + fD[1] + "/" + fD[0]}" placeholder="Data de nascimento" disabled>
                      </div>
                      <div class="form-group col-md-3">
                          <label for="inputMatricula">Matrícula</label>
                          <input type="text" class="form-control form-control-sm" id="inputMatricula" value="${Data.matricula}" placeholder="Matrícula" disabled>
                      </div>
                      <div class="form-group col-md-6">
                      <label for="inputLotacao">Lotação</label>
                      <input type="text" class="form-control form-control-sm" value="${Data.lotacao.id + ' - ' + Data.lotacao.descricao}" id="inputLotacao" disabled>
                  </div>
                  </div>
                  <div class="form-row">
                    <div class="form-group col-md-6">
                        <label for="inputEmpresa">Empresa</label>
                        <input type="text" class="form-control form-control-sm" id="inputEmpresa" value="${Data.empresa.id + ' - ' + Data.empresa.nome}" placeholder="Firjan-SENAI" disabled>
                    </div>
                    <div class="form-group col-md-6">
                        <label for="inputEstabelecimento">Estabelecimento</label>
                        <input type="text" class="form-control form-control-sm" value="${Data.estabelecimento.id + ' - ' + Data.estabelecimento.nome}" id="inputEstabelecimento" disabled>
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
                <div class="row">
                    <div class="col-md-6">
                        <button type="button" class="btn btn-primary" id="btnCancelar" style="background-color: #393230 !important; border-color: #393230;">Voltar</button>
                    </div>
                    <div class="col-md-6">
                        <buttom type="button" class="btn btn-primary" id="btnSalvar" style="float: right;">Concluir e Enviar</buttom>
                    </div>
                </div>
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

        return htmlForm;
    }
    
    public htmlFormSeguradoAvulso(cont: number) {

        let htmlForm: string = `<div class="form-row itemGlo" id="divPai_${cont}">
        <div class="form-group col-md-1" style="width: 28.499999995%; flex: 0 0 28.499%;max-width: 28.499%;">
            <label for="inputNomeBenf${cont}">Nome beneficiário</label>
            <input type="text" class="form-control form-control-sm" id="inputNomeBenf${cont}">
        </div>
        <div class="form-group col-md-1" style="width: 12.499999995%; flex: 0 0 12.499%;max-width: 12.499%;">
            <label for="inputCPFBenf${cont}">CPF</label>
            <input type="text" class="CPF form-control form-control-sm" id="inputCPFBenf${cont}">
        </div>
        <div class="form-group col-md-1" style="width: 11.499999995%; flex: 0 0 11.499%;max-width: 11.499%;">
            <label for="inputDataBenf${cont}">Data Nascimento</label>
            <input type="text" class="Date form-control form-control-sm" id="inputDataBenf${cont}">
        </div>
        <div class="form-group col-lg-2 col-md-12" id="inputParentescoBenfSelect${cont}">
            <label for="inputParentescoBenf${cont}">Parentesco</label>
            <select id="inputParentescoBenf${cont}" class="form-control form-control-sm dropdonw">
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
        <div class="form-group col-lg-2 col-md-12">
        <label for="inputTelefoneBenf${cont}">Telefone</label>
        <input type="text" class="Telefone form-control form-control-sm" id="inputTelefoneBenf${cont}">
        </div>
        <div class="form-group col-lg-1 col-md-12">
            <label for="inputPorcentagemBenf${cont}"> %</label>
            <input type="text" class="Percent form-control form-control-sm" id="inputPorcentagemBenf${cont}">
        </div>

        <buttom type="button" class="div_divPai_" id="div_divPai_${cont}" style="border-top-width: 1px;border-left-width: 1px;border-bottom-width: 1px;border-right-width: 1px;padding-left: 12px;padding-right: 12px;margin-top: 31px;margin-bottom: 6px;">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"></path>
        <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"></path>
        </svg>
        </buttom>

      </div>
    `;

        return htmlForm;
    }

    public htmlFormSegurado(DataDepend: any) {

        let fD = DataDepend.datNascimento.split("T")[0].split("-");
        var dataNascimento = fD[2] + "/" + fD[1] + "/" + fD[0];

        let depend: string = "";

        if (DataDepend.grauDependencia == 1) {
            depend += `<select id="inputParentescoBenf${DataDepend.codDependente}" class="form-control form-control-sm">
                        <option value = "Filho/Enteado" selected >Filho/Enteado</option>
                        </select>`;
        } else
        if (DataDepend.grauDependencia == 2) {
            depend += `<select id="inputParentescoBenf${DataDepend.codDependente}" class="form-control form-control-sm">
                        <option value = "Cônjuge" selected >Cônjuge</option>
                        </select>`;
        }else
        if (DataDepend.grauDependencia == 3) {
            depend += `<select id="inputParentescoBenf${DataDepend.codDependente}" class="form-control form-control-sm">
                        <option value = "Pais" selected >Pais</option>
                        </select>`;
        }else
        if (DataDepend.grauDependencia == 4) {
            depend += `<select id="inputParentescoBenf${DataDepend.codDependente}" class="form-control form-control-sm">
                        <option value = "Companheiro" selected >Companheiro</option>
                        </select>`;
        }else
        if (DataDepend.grauDependencia == 5) {
            depend += `<select id="inputParentescoBenf${DataDepend.codDependente}" class="form-control form-control-sm">
                        <option value = "Depend.Economico" selected >Depend.Economico</option>
                        </select>`;
        }else
        if (DataDepend.grauDependencia == 6) {
            depend += `<select id="inputParentescoBenf${DataDepend.codDependente}" class="form-control form-control-sm">
                        <option value = "Consignado" selected >Consignado</option>
                        </select>`;
        }else
        if (DataDepend.grauDependencia == 7) {
            depend += `<input type="text" class="GrauParentesco form-control form-control-sm" placeholder="Informe o Grau." id="inputParentescoBenf${DataDepend.codDependente}">`;
        }

        let htmlForm: string = `<div class="form-row itemGlo" id="divPai_${DataDepend.codDependente}">
        <div class="form-group col-md-1" style="width: 28.499999995%; flex: 0 0 28.499%;max-width: 28.499%;">
            <label for="inputNomeBenf${DataDepend.codDependente}">Nome beneficiário</label>
            <input type="text" class="form-control form-control-sm" id="inputNomeBenf${DataDepend.codDependente}" value="${DataDepend.nomeDependente}" disabled>
        </div>
        <div class="form-group col-md-1" style="width: 12.499999995%; flex: 0 0 12.499%;max-width: 12.499%;">
            <label for="inputCPFBenf${DataDepend.codDependente}">CPF</label>
            <input type="text" class="CPF  form-control form-control-sm" id="inputCPFBenf${DataDepend.codDependente}" value="${DataDepend.cpf}" disabled>
        </div>
        <div class="form-group col-md-1" style="width: 11.499999995%; flex: 0 0 11.499%;max-width: 11.499%;">
            <label for="inputDataBenf${DataDepend.codDependente}">Data Nascimento</label>
            <input type="text" class="Date form-control form-control-sm" id="inputDataBenf${DataDepend.codDependente}" value="${dataNascimento}" disabled>
        </div>
        <div class="form-group col-lg-2 col-md-12" >
            <label for="inputParentescoBenf${DataDepend.codDependente}">Parentesco</label>
            ${depend}
        </div>
        <div class="form-group col-lg-2 col-md-12" >
        <label for="inputTelefoneBenf${DataDepend.codDependente}">Telefone</label>
        <input type="text" class="Telefone form-control form-control-sm" id="inputTelefoneBenf${DataDepend.codDependente}">
        </div>
        <div class="form-group col-lg-1 col-md-12">
            <label for="inputPorcentagemBenf${DataDepend.codDependente}"> %</label>
            <input type="text" class="Percent form-control form-control-sm" id="inputPorcentagemBenf${DataDepend.codDependente}">
        </div>

        <buttom type="button" class="div_divPai_" id="div_divPai_${DataDepend.codDependente}" style="border-top-width: 1px;border-left-width: 1px;border-bottom-width: 1px;border-right-width: 1px;padding-left: 12px;padding-right: 12px;margin-top: 31px;margin-bottom: 6px;">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"></path>
        <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"></path>
        </svg>
        </buttom>



      </div>
    `;

        return htmlForm;
    }

    public mascaraFone(event) {
        var valor = document.getElementById("inputTelefone").attributes[0].ownerElement['value'];
        var retorno = valor.replace(/\D/g, "");
        retorno = retorno.replace(/^0/, "");
        if (retorno.length > 10) {
            retorno = retorno.replace(/^(\d\d)(\d{5})(\d{4}).*/, "($1) $2-$3");
        } else if (retorno.length > 5) {
            if (retorno.length == 6 && event.code == "Backspace") {
                return;
            }
            retorno = retorno.replace(/^(\d\d)(\d{4})(\d{0,4}).*/, "($1) $2-$3");
        } else if (retorno.length > 2) {
            retorno = retorno.replace(/^(\d\d)(\d{0,5})/, "($1) $2");
        } else {
            if (retorno.length != 0) {
                retorno = retorno.replace(/^(\d*)/, "($1");
            }
        }
        return document.getElementById("inputTelefone").attributes[0].ownerElement['value'] = retorno;
    }

    public mask(o) {
        return setTimeout(() => {
            var v = mphone(o.value);
            if (v != o.value) {
                o.value = v;
            }
        }, 1);

        function mphone(v) {
            var r = v.replace(/\D/g, "");
            r = r.replace(/^0/, "");
            if (r.length > 10) {
                r = r.replace(/^(\d\d)(\d{5})(\d{4}).*/, "($1) $2-$3");
            } else if (r.length > 5) {
                r = r.replace(/^(\d\d)(\d{4})(\d{0,4}).*/, "($1) $2-$3");
            } else if (r.length > 2) {
                r = r.replace(/^(\d\d)(\d{0,5})/, "($1) $2");
            } else {
                r = r.replace(/^(\d*)/, "($1");
            }
            return r;
        }
    }

    public loadhtml() {
        let htmlForm: string = `<html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <style>
                .loader {
                    border: 16px solid #f3f3f3;
                    border-radius: 50%;
                    border-top: 16px solid #3498db;
                    width: 120px;
                    height: 120px;
                    -webkit-animation: spin 2s linear infinite; /* Safari */
                    animation: spin 2s linear infinite;
                }
    
                /* Safari */
                @-webkit-keyframes spin {
                    0% {
                        -webkit-transform: rotate(0deg);
                    }
                    100% {
                        -webkit-transform: rotate(360deg);
                    }
                }
    
                @keyframes spin {
                    0% {
                        transform: rotate(0deg);
                    }
                    100% {
                        transform: rotate(360deg);
                    }
                }
            </style>
        </head>
        <body>
            <div class="loader" none></div>
        </body>
    </html>`;

        return htmlForm;
    }
}
