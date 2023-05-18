import Swal from 'sweetalert2';
import 'bootstrap';
import { SPHttpClient } from '@microsoft/sp-http';
require('../../node_modules/bootstrap/dist/css/bootstrap.min.css');

export class ModalComponent {
  constructor(private siteAbsoluteUrl: string, private client: SPHttpClient) { }

  public ModalCustom(titulo: string, texto: string, status: string) {

    if (status == "error") {

      return Swal.fire({
        title: titulo,
        text: texto,
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: "#DD6B55",
      });

    } else {

      return Swal.fire({
        title: titulo,
        text: texto,
        icon: 'success',
        confirmButtonText: 'OK',
        confirmButtonColor: "#32CD32",
      });

    }

  }

  public ModalCustomAlert( texto: string) {

      return Swal.fire({
        title: 'Atenção',
        text: texto,
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: "#DD6B55",
      });
    } 

  public ModalError() {
    return Swal.fire({
      title: 'Atenção!',
      text: 'Existem campos obrigatorios sem preenchimento.',
      icon: 'error',
      confirmButtonText: 'OK',
      confirmButtonColor: "#DD6B55",
    });

  }
  public ModalSucesso() {

    return Swal.fire({
      title: 'Tudo Certo!',
      text: 'Sua solicitação foi realizada com sucesso.',
      icon: 'success',
      confirmButtonText: 'OK',
      confirmButtonColor: "#32CD32"
    }).then((result) => {
      if (result.isConfirmed) {
        location.reload();
      }
    });

  }

  public ModalAvisoFormPendente() {

    return Swal.fire({
      title: 'Atenção!',
      text: 'Não é possível realizar uma nova solicitação no momento, confira se há alguma solicitação Rejeitada ou Pendente.',
      icon: 'warning',
      confirmButtonText: 'OK',
      confirmButtonColor: "#DD6B55"
    });

  }

  public ModalLoad() {

    return Swal.fire({
      title: 'Salvando...',
      showConfirmButton: false,
      timer: 2500,
    });

  }
  public ModalLoadInitTable() {
    return Swal.fire({
      title: 'Carregando...',
      showConfirmButton: false,
      timer: 500,
      timerProgressBar: true,
    });
  }

  public ModalLoadInit() {
    return Swal.fire({
      title: 'Carregando Dados...',
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true,
    });
  }


  public ModalErrorAnexo() {

    return Swal.fire({
      title: 'Atenção!',
      text: 'Anexe os documentos para submeter o formulário .',
      icon: 'error',
      confirmButtonText: 'OK',
      confirmButtonColor: "#DD6B55",
    });

  }

  public ModalAviso() {

    return Swal.fire({
      title: 'Atenção!',
      text: 'Tivemos um problema ao submeter seu formulario, preecha e envie novamente.',
      icon: 'warning',
      confirmButtonText: 'OK',
      confirmButtonColor: "#FACEA8",
    });

  }

  public ModalSucessoAssinatura() {

    return Swal.fire({
      title: 'Assinatura salva com sucesso!',
      text: ' Assine o documento para continuar',
      icon: 'success',
      confirmButtonText: 'OK',
      confirmButtonColor: "#32CD32"
    });

  }

  public ModalSignatureTrue(HashCode: string, nome: string) {

    return Swal.fire({
      title: 'Assinar este documento digitalmente',
      showDenyButton: false,
      confirmButtonText: 'Assinar',
      confirmButtonColor: "#003BD1",

    }).then((result) => {

      if (result.isConfirmed) {
        Swal.fire({

          icon: 'success',
          title: 'Documento assinado com sucesso!',
          text: 'submeta o formulário para concluir',
          showConfirmButton: false,
          timer: 2500
        });
        let SignatureBtn = (<HTMLButtonElement>document.getElementById('ActionAss'));
        SignatureBtn.innerText = `${nome} : ${HashCode}`;

      }
    });
  }

  //Cancelamento

  public ModalCancel(){
    return Swal.fire({
      title: 'Deseja cancelar esta solicitação ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#28a745',
      confirmButtonText: 'Sim, desejo cancelar!',
      cancelButtonText: 'Voltar'
    }).then((result) => {
      if (result.isConfirmed) {
        return true;
     
      }
      return false;
   
    });
  }

  public async ModalMotivoCancel(){
    var motivoCancel = await Swal.fire({
      input: 'textarea',
      inputLabel: 'Qual o motivo do cancelamento?',
      inputPlaceholder: 'Digite aqui o motivo do cancelamento',
      inputAttributes: {
        maxlength: '255',
        minlength: '10',
      },
      validationMessage: 'Motivo Obrigatório!',
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'Concluir!',
      cancelButtonText: 'Cancelar!',
      showCancelButton: true,
      inputValidator:(motivoCancelamento) =>{
        if (!motivoCancelamento){
          return 'Motivo Obrigatório!';
        }
      }
    });
    return (motivoCancel.value);
  }
  
  public async ModalSucessoCancel() {
    return Swal.fire({
      title: 'Solicitação Cancelada!',
      text: 'Sua solicitação foi cancelada com sucesso.',
      icon: 'success',
      confirmButtonText: 'OK',
      confirmButtonColor: "#32CD32"
    }).then((result) => {
      if (result.isConfirmed) {
        location.reload();
      }
    });
  }
}
