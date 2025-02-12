import 'bootstrap';
import { SPHttpClient } from '@microsoft/sp-http';
import Swal from 'sweetalert2';
require('../../node_modules/bootstrap/dist/css/bootstrap.min.css');

export class ConsultAPIComponent {
  constructor(private siteAbsoluteUrl: string, private client: SPHttpClient) { }
  private host: string = "https://svcdevext.firjan.com.br/recursoshumanos/";
  private apiDadosColab: string = this.host + "api/v2/colaboradores/me?IncluirEmpresa=true&IncluirEstabelecimento=true&IncluirCargo=true&IncluirLotacao=true&IncluirDocumentacao=true";
  private apiDadosBeneficColab: string = this.host + "api/v2/colaboradores/beneficios-ativos/me";
  private apiDadosDependColab: string = this.host + "api/v2/colaboradores/dependentes-ativos/me";

  private apiDadosDependTESTE1: string = this.host + "https://svcdevext.firjan.com.br/recursoshumanos/api/v2/colaboradores/dependentes-ativos?IdEmpresa=1&IdEstabelecimento=1&Matricula=20924";
  private apiDadosDependTESTE2: string = this.host + "https://svcdevext.firjan.com.br/recursoshumanos/api/v2/colaboradores/dependentes-ativos?IdEmpresa=1&IdEstabelecimento=1&Matricula=20924";

  public async ObterDadosColabLogado(token: string) {
    return fetch(this.apiDadosColab, {
      method: 'GET',
      mode: 'cors',
      headers: {
        "Authorization": 'Bearer ' + token
      }
    })
      .then((data) => data.json())
      .then((data) => {
        return data;
      })
      .catch((err) => {
        console.log(err);
        this.ModalCustom("Atenção!", "Erro ao consultar a API do RH. Favor tente mais tarde. Code: DATA_550", "error");
      });
  }

  public async ObterBeneficiosColabLogado(token: string) {

    return fetch(this.apiDadosBeneficColab, {
      method: 'GET',
      mode: 'cors',
      headers: {
        "Authorization": 'Bearer ' + token
      }
    })
      .then((data) => data.json())
      .then((data) => {
        return data;
      })
      .catch((err) => {
        console.log(err);
        this.ModalCustom("Atenção!", "Encontramos problemas ao tentar carregar dados da API do RH. Favor tente mais tarde. Code: BENEF_551", "error");
      });
  }

  public async ObterDependentesAtivos(token: string) {
    return fetch(this.apiDadosDependColab, {
      method: 'GET',
      mode: 'cors',
      headers: {
        "Authorization": 'Bearer ' + token
      }
    })
      .then((data) => data.json())
      .then((data) => {
        return data;
      })
      .catch((err) => {
        console.log(err);
        this.ModalCustom("Atenção!", "Encontramos problemas ao tentar carregar dados da API do RH. Favor tente mais tarde. Code: DEPEND_552", "error");
      });
  }

  public ModalCustom(titulo: string, texto: string, status: string) {

      return Swal.fire({
        title: titulo,
        text: texto,
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: "#DD6B55",
      }).then((result) => {
        location.reload();
        });
    }
}


