import { FormControl, Validators, FormGroup } from '@angular/forms';
import { Component, OnInit } from '@angular/core';

import { UtilidadesService } from 'src/app/services/utilidades.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { RiesgosService } from 'src/app/services/riesgos.service';
import { CatalogosService } from 'src/app/services/catalogos.service';
import { MatrizService } from 'src/app/services/matriz.service';

import { MatrizContinuidadService } from 'src/app/services/matriz-continuidad.service';
import { PlanRiesgosService } from 'src/app/services/plan-riesgos.service';
import Swal from 'sweetalert2'

@Component({
  selector: 'app-matriz-periodos',
  templateUrl: './matriz-periodos.component.html',
  styleUrls: ['./matriz-periodos.component.css']
})

export class MatrizPeriodosComponent implements OnInit {
  usuario: any = {}
  unidadesEjecutoras: any = [];
  periodos: any = [];
  showTablePeriodos: boolean = false;
  routeIngresoRiesgos: any = '/admin/riesgos/'
  periodoSeleccionado: any;

  matrizPeriodosEncontrados: any = []

  formSearchCreateMatrizPeriodo = new FormGroup({
    id_unidad_ejecutora: new FormControl('', Validators.required),
    id_periodo: new FormControl('', Validators.required),
  })

  constructor(
    private catalogsService: CatalogosService,
    private matrizService: MatrizService,
    private usuarioService: UsuarioService,
    private utilidades: UtilidadesService,
    private riesgoService: RiesgosService,
    private planService: PlanRiesgosService,
    private matrizContinuidadService: MatrizContinuidadService
  ) { }

  ngOnInit(): void {
    this.utilidades.removeFiltroCache();
    this.catalogsService.getPeriodos().subscribe(resultPeriodos => {
      this.periodos = resultPeriodos
      if (sessionStorage.getItem('Unidad') && sessionStorage.getItem('Periodo')) {
        this.formSearchCreateMatrizPeriodo.setValue({
          id_unidad_ejecutora: sessionStorage.getItem('Unidad'),
          id_periodo: sessionStorage.getItem('Periodo')
        })
        this.validarFormBusqueda();
      }
      //Se obtiene el usuario actual y en base a el se limitan las UE
      this.usuarioService.obtenerUsuario().subscribe((resultUsuarios: any) => {
        this.usuario = resultUsuarios
        if (this.usuario.id_rol == 1 || this.usuario.id_rol == 3) {
          this.catalogsService.getUnidadEjecutora().subscribe(unidades => {
            this.unidadesEjecutoras = unidades.filter((unidad: any) => unidad.codigo_unidad < 999)
          }, err => {
            this.utilidades.showErrorCatalogos();
          });
        } else {
          this.catalogsService.getUnidadEjecutoraById(this.usuario.id_unidad_ejecutora).subscribe(unidades => {
            this.unidadesEjecutoras = unidades
          }, err => {
            this.utilidades.showErrorCatalogos();
          })
        }
      }, err => {
        this.utilidades.showErrorCatalogos();
      })
    }, err => {
      this.utilidades.showErrorCatalogos();
    })
  }

  validarFormMatriz() {
    const valuePeriodo = this.formSearchCreateMatrizPeriodo.get('id_periodo')?.value
    this.periodoSeleccionado = this.periodos.filter((item: any) => item.id_periodo == valuePeriodo)
    const periodoSeleccionado = this.periodos.find((value: any) => value.id_periodo == this.formSearchCreateMatrizPeriodo.get('id_periodo')?.value)
    if (this.formSearchCreateMatrizPeriodo.get('id_unidad_ejecutora')?.invalid) {
      this.utilidades.showWarning('¡Faltan campos por llenar!', 'Por favor ingrese una unidad ejecutora')
    } else if (this.formSearchCreateMatrizPeriodo.get('id_periodo')?.invalid) {
      this.utilidades.showWarning('¡Faltan campos por llenar!', 'Por favor ingrese un periodo')
    } else if (periodoSeleccionado.periodo_abierto == 0) {
      this.utilidades.showWarning('¡Periodo cerrado!', 'El periodo ya se encuentra cerrado, no puede ingresar nuevos registros')
    } else {
      this.createNewMatrizPeriodo()
    }
  }

  validarFormBusqueda() {
    const valuePeriodo = this.formSearchCreateMatrizPeriodo.get('id_periodo')?.value
    this.periodoSeleccionado = this.periodos.filter((item: any) => item.id_periodo == valuePeriodo)
    if (this.formSearchCreateMatrizPeriodo.get('id_unidad_ejecutora')?.invalid) {
      this.utilidades.mostrarErrorNoti('Selecciona una unidad ejecutora')
    } else if (this.formSearchCreateMatrizPeriodo.get('id_periodo')?.invalid) {
      this.utilidades.mostrarErrorNoti('Selecciona un periodo')
    } else {
      this.findMatrizPeriodo()
    }
  }

  createNewMatrizPeriodo() {
    const valuePeriodo = this.formSearchCreateMatrizPeriodo.get('id_periodo')?.value
    this.periodoSeleccionado = this.periodos.filter((item: any) => item.id_periodo == valuePeriodo)
    const periodoSeleccionado = this.periodos.find((value: any) => value.id_periodo == this.formSearchCreateMatrizPeriodo.get('id_periodo')?.value)
    const dataSearch = {
      ...this.formSearchCreateMatrizPeriodo.value,
      fecha_periodo_inicio: periodoSeleccionado.fecha_inicio,
      fecha_periodo_fin: periodoSeleccionado.fecha_fin
    }

    //Se verifica que el encabezado no exista actualmente en la DB
    this.matrizService.getMatrizByParams(dataSearch).subscribe((value) => {
      if (value.existencia == 0) {
        const newPeriodo = {
          ...dataSearch,
          usuario_registro: this.usuario.id_usuario
        }
        this.matrizService.createMatriz(newPeriodo).subscribe(() => {
          Swal.fire({
            icon: 'success',
            text: '¡El registro se agrego correctamente!',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'Aceptar'
          })
          this.matrizService.getMatrizByParams(dataSearch).subscribe((value: any) => {
            this.showTablePeriodos = true;
            this.matrizPeriodosEncontrados = value.res;
          })
        },
          err => {
            Swal.fire({
              icon: 'error',
              text: '¡Error al ingresar el registro!',
              confirmButtonColor: '#3085d6',
              confirmButtonText: 'Aceptar'
            })
          })
      } else if (value.existencia == 1) {
        this.utilidades.showWarning('¡El registro ya existe!', 'Actualmente existe un registro con estos parametros')
      }
    }, err => {
      this.utilidades.showError('¡Error en el proceso de registro!', 'Ocurrió un error mientras se ingresaban los datos, por favor intente nuevamente')
    })
  }

  findMatrizPeriodo() {

    //Se asigna el periodo seleccionado a la variable para saber si esta abierto o cerrado
    const valuePeriodo = this.formSearchCreateMatrizPeriodo.get('id_periodo')?.value
    this.periodoSeleccionado = this.periodos.filter((item: any) => item.id_periodo == valuePeriodo)

    const periodoSeleccionado = this.periodos.find((value: any) => value.id_periodo == this.formSearchCreateMatrizPeriodo.get('id_periodo')?.value)
    const dataSearch = {
      ...this.formSearchCreateMatrizPeriodo.value,
      fecha_periodo_inicio: periodoSeleccionado.fecha_inicio,
      fecha_periodo_fin: periodoSeleccionado.fecha_fin
    }
    this.matrizService.getMatrizByParams(dataSearch)
      .subscribe(matriz => {
        if (matriz.existencia == 0) {
          this.showTablePeriodos = false;
          Swal.fire({
            icon: 'error',
            text: '¡No existe ningún registro con estos parámetros!',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'Aceptar'
          })
        } else if (matriz.existencia == 1) {
          this.showTablePeriodos = true;
          this.matrizPeriodosEncontrados = matriz.res;
        }
      },
        err => {
          this.showTablePeriodos = false;
          Swal.fire({
            icon: 'error',
            text: '¡No se pudo realizar la búsqueda correctamente!',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'Aceptar'
          })

        })
  }

  deletePeriodoMatriz(id_matriz: any) {
    Swal.fire({
      title: '¿Estás seguro de eliminar este registro?',
      text: "¡No podrás revertir este cambio!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, ¡eliminarlo!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.matrizService.deleteMatriz(id_matriz).subscribe((value: any) => {
          Swal.fire({
            icon: 'success',
            text: '¡El registro se eliminó correctamente!',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'Aceptar'
          });
          this.riesgoService.deleteRiesgoByIdMatriz(value[0]).subscribe((value: any) => {
          })
          this.showTablePeriodos = false
        }, err => {
          Swal.fire({
            icon: 'error',
            text: '¡No se pudo eliminar el registro!',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'Aceptar'
          })
        });
      }
    })
  }

  cerrarPeriodo(id_matriz: any) {
    this.planService.getExistenciaPlanTrabajoPendiente(id_matriz).subscribe((resultPlan: any) => {

      this.matrizContinuidadService.getExistenciaMatrizContinuidad(id_matriz).subscribe((resultMatrizContinuidad: any) => {
        if (resultPlan > 0 && resultMatrizContinuidad > 0) {
          Swal.fire({
            icon: 'warning',
            text: `¡Aún existen planes de trabajo y matrices de continuidad pendientes de ingresar!`,
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'Aceptar'
          })
        } else if (resultPlan > 0 && resultMatrizContinuidad == 0) {
          Swal.fire({
            icon: 'warning',
            text: `¡Aún existen planes de trabajo pendientes de ingresar!`,
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'Aceptar'
          })
        } else if (resultPlan == 0 && resultMatrizContinuidad > 0) {
          Swal.fire({
            icon: 'warning',
            text: `¡Aún existen matrices de continuidad pendientes de ingresar!`,
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'Aceptar'
          })

        } else {
          if (this.matrizPeriodosEncontrados[0].periodo_abierto === 1) {
            Swal.fire({
              title: '¿Está seguro de validar este registro?',
              text: "¡Si realiza esta acción los riesgos solo podrán visualizarse!",
              icon: 'question',
              showCancelButton: true,
              confirmButtonColor: '#3085d6',
              cancelButtonColor: '#d33',
              confirmButtonText: 'Si, validar registro!',
              cancelButtonText: 'Cancelar'
            }).then((result) => {
              if (result.isConfirmed) {
                this.matrizService.updateMatriz(id_matriz, 0).subscribe(() => {
                  Swal.fire({
                    icon: 'success',
                    text: '¡El registro se ha validado correctamente!',
                    confirmButtonColor: '#3085d6',
                    confirmButtonText: 'Aceptar'
                  });

                  const periodoSeleccionado = this.periodos.find((value: any) => value.id_periodo == this.formSearchCreateMatrizPeriodo.get('id_periodo')?.value)
                  const dataSearch = {
                    ...this.formSearchCreateMatrizPeriodo.value,
                    fecha_periodo_inicio: periodoSeleccionado.fecha_inicio,
                    fecha_periodo_fin: periodoSeleccionado.fecha_fin
                  }
                  this.matrizService.getMatrizByParams(dataSearch)
                    .subscribe(matriz => {
                      this.showTablePeriodos = true;
                      this.matrizPeriodosEncontrados = matriz.res;
                    })
                }, err => {
                  Swal.fire({
                    icon: 'error',
                    text: '¡No se pudo validar el registro, ha ocurrido un error!',
                    confirmButtonColor: '#3085d6',
                    confirmButtonText: 'Aceptar'
                  })
                });
              }
            })
          } else {
            Swal.fire({
              text: 'El registro ya se encuentra validado',
              icon: 'warning',
              confirmButtonColor: '#3085d6',
              confirmButtonText: 'Aceptar'
            })
          }
        }
      })
    })
  }

  abrirPeriodo(id_matriz: any) {
    if (this.matrizPeriodosEncontrados[0].periodo_abierto === 0) {
      Swal.fire({
        title: '¿Está seguro de habilitar nuevamente este registro?',
        text: "¡Se habilitarán las opciones de editar nuevamente",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Si, habilitar registro!',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          this.matrizService.updateMatriz(id_matriz, 1).subscribe(() => {
            Swal.fire({
              icon: 'success',
              text: '¡El registro se ha habilitado correctamente!',
              confirmButtonColor: '#3085d6',
              confirmButtonText: 'Aceptar'
            });

            const periodoSeleccionado = this.periodos.find((value: any) => value.id_periodo == this.formSearchCreateMatrizPeriodo.get('id_periodo')?.value)
            const dataSearch = {
              ...this.formSearchCreateMatrizPeriodo.value,
              fecha_periodo_inicio: periodoSeleccionado.fecha_inicio,
              fecha_periodo_fin: periodoSeleccionado.fecha_fin
            }
            this.matrizService.getMatrizByParams(dataSearch)
              .subscribe(matriz => {
                this.showTablePeriodos = true;
                this.matrizPeriodosEncontrados = matriz.res;
              })
          }, err => {
            Swal.fire({
              icon: 'error',
              text: '¡No se pudo habilitar el registro, ha ocurrido un error!',
              confirmButtonColor: '#3085d6',
              confirmButtonText: 'Aceptar'
            })
          });
        }
      })
    } else {
      Swal.fire({
        text: 'El registro ya se encuentra habilitado',
        icon: 'warning',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Aceptar'
      })
    }
  }

  saveInCache() {
    sessionStorage.setItem('Unidad', this.formSearchCreateMatrizPeriodo.get('id_unidad_ejecutora')?.value)
    sessionStorage.setItem('Periodo', this.formSearchCreateMatrizPeriodo.get('id_periodo')?.value)
  }
}
