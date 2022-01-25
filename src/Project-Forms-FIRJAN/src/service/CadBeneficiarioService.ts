import {
    SPHttpClient,
    SPHttpClientResponse,
    ISPHttpClientOptions,
    //SPHttpClientBatch
} from '@microsoft/sp-http';

import { ICadBeneficiarioListItem } from '../models';

///_api/web/lists/getbytitle('CadBeneficiario')/items?&$filter=IDSegurado eq '7'$select=ID,Nome,CPF,DataNascimento,Telefone,Parentesco,Porcentagem,IDSegurado

const LIST_API_ENDPOINT: string = `/_api/web/lists/getbytitle('CadBeneficiario')`;
const SELECT_QUERY: string = '&$select=ID,Nome,CPF,DataNascimento,Telefone,Parentesco,Porcentagem,IDSegurado';
const FILTER_QUERY: string = '&$filter=(IDSegurado eq )';


export class CadBeneficiarioService {

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
     * Return collection of all NASA Apollo missions.
     *
     * @returns {ICadBeneficiario[]}      Collection of missions.
     * @memberof CadBeneficiarioService
     */
    public getBeneficiarios(IDSeg: number): Promise<ICadBeneficiarioListItem[]> {
        let promise: Promise<ICadBeneficiarioListItem[]> = new Promise<ICadBeneficiarioListItem[]>((resolve, reject) => {

            this.client.get(`${this.siteAbsoluteUrl}${LIST_API_ENDPOINT}/items?&$filter=IDSegurado eq ${IDSeg}${SELECT_QUERY}&$orderby=ID asc`,

                SPHttpClient.configurations.v1,
                this._spHttpOptions.getNoMetadata
            ) // get response & parse body as JSON
                .then((response: SPHttpClientResponse): Promise<{ value: ICadBeneficiarioListItem[] }> => {
                    return response.json();
                }) // get parsed response as array, and return
                .then((response: { value: ICadBeneficiarioListItem[] }) => {
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
     * @memberof CadBeneficiarioService
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
     * Create a single CreateLog on the list.
     *
     * @param {ICadBeneficiarioListItem} newCadBeneficiario CadBeneficiario to create.
     * @returns {Promise<void>}
     * @memberof CadBeneficiarioService
     */
    public CreateCadBeneficiario(newCadBeneficiario: ICadBeneficiarioListItem): Promise<void> {
        let promise: Promise<void> = new Promise<void>((resolve, reject) => {
            // first, get the type of thing we're creating...
            this._getItemEntityType()
                .then((spEntityType: string) => {
                    // create item to create
                    let newListItem: ICadBeneficiarioListItem = newCadBeneficiario;
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
                .then((response: SPHttpClientResponse): Promise<ICadBeneficiarioListItem> => {
                    return response.json();
                })
                .then((newSpListItem: ICadBeneficiarioListItem): void => {
                    resolve();
                })
                .catch((error: any) => {
                    reject(error);
                });
        });
        return promise;
    }

} 