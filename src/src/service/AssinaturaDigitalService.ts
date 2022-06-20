import {
    SPHttpClient,
    SPHttpClientResponse,
    ISPHttpClientOptions,
    //SPHttpClientBatch
} from '@microsoft/sp-http';

import { IAssinaturaDigitalListItem } from '../models';

///_api/web/lists/getbytitle('SignatureData')/items?&$filter=(NomeUsuario eq 'Jorge Ilya Masta')and(EmailUsuario eq 'COGTIT700@firjan.com.br')&$select=ID,NomeUsuario,EmailUsuario,HashCode,

const LIST_API_ENDPOINT: string = `/_api/web/lists/getbytitle('SignatureData')`;
const SELECT_QUERY: string = '&$select=ID,NomeUsuario,EmailUsuario,HashCode';
const FILTER_QUERY: string = '&$filter=';


export class AssinaturaDigitalService {

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
    public getAssinatura(UserName: string, UserEmail: string): Promise<IAssinaturaDigitalListItem> {
        let promise: Promise<IAssinaturaDigitalListItem> = new Promise<IAssinaturaDigitalListItem>((resolve, reject) => {
            this.client.get(`${this.siteAbsoluteUrl}${LIST_API_ENDPOINT}/items?&$filter=(NomeUsuario eq '${UserName}')and(EmailUsuario eq '${UserEmail}')${SELECT_QUERY}`,
                SPHttpClient.configurations.v1,
                this._spHttpOptions.getFullMetadata
            ) // get response & parse body as JSON
                .then((response: SPHttpClientResponse): Promise<IAssinaturaDigitalListItem> => {
                    return response.json();
                }) // get parsed response as array, and return
                .then((response: IAssinaturaDigitalListItem) => {
                    resolve(response);
                })
                .catch((error: any) => {
                    reject(error);
                });
        });
        return promise;
    }

    /**
     * Return collection of all NASA Apollo missions.
     *
     * @returns {IAssinaturaDigital[]}      Collection of missions.
     * @memberof AssinaturaDigitalService
     */
    public getAssinaturas(UserName: string, UserEmail: string): Promise<IAssinaturaDigitalListItem[]> {
        let promise: Promise<IAssinaturaDigitalListItem[]> = new Promise<IAssinaturaDigitalListItem[]>((resolve, reject) => {

            this.client.get(`${this.siteAbsoluteUrl}${LIST_API_ENDPOINT}/items?&$filter=(NomeUsuario eq '${UserName}')and(EmailUsuario eq '${UserEmail}')${SELECT_QUERY}&$orderby=ID desc&$top=1`,

                SPHttpClient.configurations.v1,
                this._spHttpOptions.getNoMetadata
            ) // get response & parse body as JSON
                .then((response: SPHttpClientResponse): Promise<{ value: IAssinaturaDigitalListItem[] }> => {
                    return response.json();
                }) // get parsed response as array, and return
                .then((response: { value: IAssinaturaDigitalListItem[] }) => {
                    resolve(response.value);
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
     * @private
     * @returns {Promise<string>}
     * @memberof AssinaturaDigitalService
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
      * Retorna o ultimo item criado na lista
      *
      * 
      * @static
      * @returns {ICadSegurado}
      * @memberof CadSeguradoService
      */
    public getLastAssinatura(): Promise<IAssinaturaDigitalListItem> {
        let promise: Promise<IAssinaturaDigitalListItem> = new Promise<IAssinaturaDigitalListItem>((resolve, reject) => {
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
     * Create a single CreateLog on the list.
     *
     * @param {IAssinaturaDigitalListItem} newAssinaturaDigital CadBeneficiario to create.
     * @returns {Promise<void>}
     * @memberof AssinaturaDigitalService
     */
    public CreateAssinaturaDigital(newAssinaturaDigital: IAssinaturaDigitalListItem): Promise<void> {
        let promise: Promise<void> = new Promise<void>((resolve, reject) => {
            // first, get the type of thing we're creating...
            this._getItemEntityType()
                .then((spEntityType: string) => {
                    // create item to create
                    let newListItem: IAssinaturaDigitalListItem = newAssinaturaDigital;
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
                .then((response: SPHttpClientResponse): Promise<IAssinaturaDigitalListItem> => {
                    return response.json();
                })
                .then((newSpListItem: IAssinaturaDigitalListItem): void => {
                    resolve();
                })
                .catch((error: any) => {
                    reject(error);
                });
        });
        return promise;
    }

} 