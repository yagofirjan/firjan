export interface ICadSeguradoListItem {

    ID: number;
    Nome: string;
    CPF:string;
    DataNascimento:string;
    Matricula:string;
    Empresa:string;
    Estabelecimento:string;
    Lotacao:string;
    Estado:string;
    DataAssinatura:string;
    Status:string;
    Author: string;
    AttachmentFiles:{
        Title: string;
        id: number;
        ServerRelativeUrl:string;
        Attachments: boolean;
    };
    Assinatura:string;
  

    }