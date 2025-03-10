import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RiesgosService {
  private apiUrl = `${environment.URL_API}/riesgo`;

  constructor(private http: HttpClient) { }

  createRiesgo(data: any) {
    return this.http.post(this.apiUrl, data);
  }

  getRiesgosByParams(data: any) {
    const result = this.http.get<any>(this.apiUrl, {
      params: data
    });
    return result;
  }


  getRiesgosByFiltros(filtro: any) {
    return this.http.get<any>(`${this.apiUrl}/filtro`, { params: filtro });
  }

  getRiesgoByIdMatriz(id_riesgo: any, offset: any) {
    return this.http.get<any>(`${this.apiUrl}/${id_riesgo}/${offset}`);
  }

  getAllRiesgoByIdMatriz(id_matriz: any) {
    return this.http.get<any>(`${this.apiUrl}/riesgoMatriz/${id_matriz}`);
  }

  getRiesgoByIdMatrizRef(periodo_anio: any) {
    return this.http.get<any>(`${this.apiUrl}/updateRef/${periodo_anio}`);
  }

  getRiesgoById(id_riesgo: any) {
    return this.http.get<any>(`${this.apiUrl}/search/${id_riesgo}`);
  }

  deleteRiesgo(id_riesgo: any) {
    return this.http.patch<any>(`${this.apiUrl}/delete/${id_riesgo}`, { estado_registro: 0 });
  }
  deleteRiesgoByIdMatriz(id_matriz: any) {
    return this.http.patch<any>(`${this.apiUrl}/matriz/${id_matriz}`, { estado_registro: 0 });
  }
  ///update service riesgo
  updateRiesgo(id_riesgo: any, data: any) {
    return this.http.patch<any>(`${this.apiUrl}/update/${id_riesgo}`, data);
  }

  getRiesgoToEdit(id_riesgo: any) {
    return this.http.get<any>(`${this.apiUrl}/update/${id_riesgo}`);
  }

}
