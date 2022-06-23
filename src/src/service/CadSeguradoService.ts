import {
    SPHttpClient,
    SPHttpClientResponse,
    ISPHttpClientOptions,
    //SPHttpClientBatch
} from '@microsoft/sp-http';

import { ICadSeguradoListItem } from '../models';

///_api/web/lists/getbytitle('CadSegurado')/items?$select=ID,Nome,CPF,DataNascimento,Matricula,Empresa,Estabelecimento,Lotacao,Estado,DataAssinatura,Assinatura,Status,Author/ID,Author/Title,AttachmentFiles/ServerRelativeUrl,AttachmentFiles/Title&$expand=Author/ID,Author/Title,AttachmentFiles/ServerRelativeUrl,AttachmentFiles/Title
const LIST_API_ENDPOINT: string = `/_api/web/lists/getbytitle('CadSegurado')`;
const SELECT_QUERY: string = '$select=ID,Nome,CPF,DataNascimento,Matricula,Empresa,Estabelecimento,Lotacao,Estado,DataAssinatura,Assinatura,Status,Author/ID,Author/Title,AttachmentFiles/ServerRelativeUrl,AttachmentFiles/Title&$expand=Author/ID,Author/Title,AttachmentFiles/ServerRelativeUrl,AttachmentFiles/Title';
const FILTER_QUERY: string = '&$filter=Author/Title eq ';


export class CadSeguradoService {

    /* Setup common headers for different requests.*/
    private _spHttpOptions: any = {
        getNoMetadata: <ISPHttpClientOptions>{
            headers: { 'ACCEPT': 'application/json; odata.metadata=none' }
        },
        getFullMetadata: <ISPHttpClientOptions>{
            headers: { 'ACCEPT': 'application/json; odata.metadata=full' }
        },
        postNoMetadata: <ISPHttpClientOptions>{
            headers: {
                'ACCEPT': 'application/json; odata.metadata=none',
                'CONTENT-TYPE': 'application/json',
            }
        },
        updateNoMetadata: <ISPHttpClientOptions>{
            headers: {
                'ACCEPT': 'application/json; odata.metadata=none',
                'CONTENT-TYPE': 'application/json',
                'X-HTTP-Method': 'MERGE'
            }
        },
        deleteNoMetadata: <ISPHttpClientOptions>{
            headers: {
                'ACCEPT': 'application/json; odata.metadata=none',
                'CONTENT-TYPE': 'application/json',
                'X-HTTP-Method': 'DELETE'
            }
        }
    };

    constructor(private siteAbsoluteUrl: string, private client: SPHttpClient) { }


    /**
     * Retorna um unico item de lista consultando po ID
     * 
     * 
     * @static
     * @param {string}    missionId - ID of the Grupo to retrieve.
     * @returns {IGrupo}
     * @memberof GrupoService
     */
    public getCadSegurado(missionId: any): Promise<ICadSeguradoListItem> {
        let promise: Promise<ICadSeguradoListItem> = new Promise<ICadSeguradoListItem>((resolve, reject) => {
            this.client.get(`${this.siteAbsoluteUrl}${LIST_API_ENDPOINT}/items(${missionId})?${SELECT_QUERY}`,
                SPHttpClient.configurations.v1,
                this._spHttpOptions.getFullMetadata
            ) // get response & parse body as JSON
                .then((response: SPHttpClientResponse): Promise<ICadSeguradoListItem> => {
                    return response.json();
                }) // get parsed response as array, and return
                .then((response: ICadSeguradoListItem) => {
                    resolve(response);
                })
                .catch((error: any) => {
                    reject(error);
                });
        });
        return promise;
    }


    /**
    * Retorna um unico item de lista consultando po ID
    * 
    * 
    * @static
    * @param {string}    missionId - ID of the Grupo to retrieve.
    * @returns {IGrupo}
    * @memberof GrupoService
    */
    public getCadSegur(user: any): Promise<ICadSeguradoListItem> {
        let promise: Promise<ICadSeguradoListItem> = new Promise<ICadSeguradoListItem>((resolve, reject) => {
            this.client.get(`${this.siteAbsoluteUrl}${LIST_API_ENDPOINT}/items?${SELECT_QUERY}&$filter=Author/Title eq '${user}'&$orderby=ID desc&$top=1`,
                SPHttpClient.configurations.v1,
                this._spHttpOptions.getFullMetadata
            ) // get response & parse body as JSON
                .then((response: SPHttpClientResponse): Promise<ICadSeguradoListItem> => {
                    return response.json();
                }) // get parsed response as array, and return
                .then((response: ICadSeguradoListItem) => {
                    resolve(response);
                })
                .catch((error: any) => {
                    reject(error);
                });
        });
        return promise;
    }

    /**
     * Retorna todos os itens de uma lista 
     *
     * 
     * @returns {ICadSegurado[]}      Collection of items.
     * @memberof CadSeguradoService
     */
    public getCadSegurados(user: string): Promise<ICadSeguradoListItem[]> {
        let promise: Promise<ICadSeguradoListItem[]> = new Promise<ICadSeguradoListItem[]>((resolve, reject) => {

            this.client.get(`${this.siteAbsoluteUrl}${LIST_API_ENDPOINT}/items?${SELECT_QUERY}&$filter=Author/Title eq '${user}'`,/**modificar para trazer se tiver alguma linha com status  aprovado ou pendente se for rejeitado deve trazer o formulario */

                SPHttpClient.configurations.v1,
                this._spHttpOptions.getNoMetadata
            ) // get response & parse body as JSON
                .then((response: SPHttpClientResponse): Promise<{ value: ICadSeguradoListItem[] }> => {
                    return response.json();
                }) // get parsed response as array, and return
                .then((response: { value: ICadSeguradoListItem[] }) => {
                    resolve(response.value);
                })
                .catch((error: any) => {
                    reject(error);
                });
        });

        return promise;
    }


    /**
      * Retorna o ultimo item criado na lista
      *
      * 
      * @static
      * @returns {ICadSegurado}
      * @memberof CadSeguradoService
      */
    public getLastSegurado(): Promise<ICadSeguradoListItem> {
        let promise: Promise<ICadSeguradoListItem> = new Promise<ICadSeguradoListItem>((resolve, reject) => {
            this.client.get(`${this.siteAbsoluteUrl}${LIST_API_ENDPOINT}/items?${SELECT_QUERY}&$orderby=ID desc&$top=1`,
                SPHttpClient.configurations.v1,
                this._spHttpOptions.getFullMetadata
            ) // get response & parse body as JSON
                .then((response: SPHttpClientResponse): Promise<any> => {
                    return response.json();
                }) // get parsed response as array, and return
                .then((response: any) => {
                    resolve(response.value[0]);
                })
                .catch((error: any) => {
                    reject(error);
                });
        });
        return promise;
    }


    /**
      * Retorna o ultimo item criado na lista de um usuário
      *
      * 
      * @static
      * @returns {ICadSegurado}
      * @memberof CadSeguradoService
      */
     public getLastBySegurado(user: string): Promise<ICadSeguradoListItem> {
        let promise: Promise<ICadSeguradoListItem> = new Promise<ICadSeguradoListItem>((resolve, reject) => {
            this.client.get(`${this.siteAbsoluteUrl}${LIST_API_ENDPOINT}/items?${SELECT_QUERY}&$filter=Author/Title eq '${user}'`,
                SPHttpClient.configurations.v1,
                this._spHttpOptions.getFullMetadata
            ) // get response & parse body as JSON
                .then((response: SPHttpClientResponse): Promise<any> => {
                    return response.json();
                }) // get parsed response as array, and return
                .then((response: any) => {
                    resolve(response.value[0]);
                })
                .catch((error: any) => {
                    reject(error);
                });
        });
        return promise;
    }

    /**
     * Retrieve the entity type as a string for the list
     *
     * 
     * @private
     * @returns {Promise<string>}
     * @memberof CadSeguradoService
     */
    private _getItemEntityType(): Promise<string> {
        let promise: Promise<string> = new Promise<string>((resolve, reject) => {
            this.client.get(`${this.siteAbsoluteUrl}${LIST_API_ENDPOINT}?$select=ListItemEntityTypeFullName`,
                SPHttpClient.configurations.v1,
                this._spHttpOptions.getNoMetadata
            )
                .then((response: SPHttpClientResponse): Promise<{ ListItemEntityTypeFullName: string }> => {
                    return response.json();
                })
                .then((response: { ListItemEntityTypeFullName: string }): void => {
                    resolve(response.ListItemEntityTypeFullName);
                })
                .catch((error: any) => {
                    reject(error);
                });
        });
        return promise;
    }


    /**
     * Cria o resgistro de um item na lista 
     *
     * 
     * @param {ICadSeguradoListItem} newCadSegurado CadSegurado to create.
     * @returns {Promise<void>}
     * @memberof CadSeguradoService
     */
    public CreateCadSegurado(newCadSegurado: ICadSeguradoListItem): Promise<void> {
        let promise: Promise<void> = new Promise<void>((resolve, reject) => {
            // first, get the type of thing we're creating...
            this._getItemEntityType()
                .then((spEntityType: string) => {
                    // create item to create
                    let newListItem: ICadSeguradoListItem = newCadSegurado;
                    // add SP-required metadata
                    newListItem['@odata.type'] = spEntityType;

                    // build request
                    let requestDetails: any = this._spHttpOptions.postNoMetadata;
                    requestDetails.body = JSON.stringify(newListItem);

                    // create the item
                    return this.client.post(`${this.siteAbsoluteUrl}${LIST_API_ENDPOINT}/items`,
                        SPHttpClient.configurations.v1,
                        requestDetails
                    );
                })
                .then((response: SPHttpClientResponse): Promise<ICadSeguradoListItem> => {
                    return response.json();
                })
                .then((newSpListItem: ICadSeguradoListItem): void => {
                    resolve();
                })
                .catch((error: any) => {
                    reject(error);
                });
        });
        return promise;
    }


   




} 