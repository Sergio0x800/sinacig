import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CatalogosService } from 'src/app/services/catalogos.service';
import { PlanRiesgosService } from 'src/app/services/plan-riesgos.service';
import { ActivatedRoute, Router } from '@angular/router';
import { RiesgosService } from 'src/app/services/riesgos.service';
import { DATES, IAngularMyDpOptions } from 'angular-mydatepicker';

import Swal from 'sweetalert2';
import { UsuarioService } from 'src/app/services/usuario.service';
import { UtilidadesService } from 'src/app/services/utilidades.service';
import { MatrizService } from 'src/app/services/matriz.service';


@Component({
  selector: 'app-ingreso-plan-trabajo',
  templateUrl: './ingreso-plan-trabajo.component.html',
  styleUrls: ['./ingreso-plan-trabajo.component.css']
})
export class IngresoPlanTrabajoComponent implements OnInit {

  //parametro enviado por url desde ingreso riesgos y riesgos
  id_riesgo: string | null = null;

  //configuracion de mydatepicker
  periodoObtenido: any;
  fechaInicioPeriodo: any;
  fechaFinalPeriodo: any;
  anioInicio: any;
  mesInicio: any;
  diaInicio: any;
  anioFinal: any;
  mesFinal: any;
  diaFinal: any;
  myDpOptions: IAngularMyDpOptions = {};
  myDpOptions2: IAngularMyDpOptions = {};
  myDateInit: boolean = true;
  model: any = null;
  myDateInicioFin: any = {};
  locale: string = 'es'

  //incializando catalogos
  prioridades: any = [];
  puestos: any = [];

  //variable que almacena el riesgo asociado a este plan de trabajo
  riesgo: any = {};

  showTableRecursos = false
  showTableControlImplementacion = false

  //controles y recursos
  recursos: any = [];
  controlesInternos: any = [];
  controlesImplementacion: any = [];

  id_plan_trabajoRecurso: any = 0;
  id_plan_trabajoControlInt: any = 0;
  id_plan_trabajoControlImple: any = 0;

  usuario: any = {}

  linkPlan: string = '';
  showBtn: boolean = true;
  showOptions: boolean = false;

  prioridadInvalid = false;
  prioridadValid = false;
  puestoInvalid = false;
  puestoValid = false;
  fechaInicioInvalid = false;
  fechaInicioValid = false;
  fechaFinInvalid = false;
  fechaFinValid = false;

  queInvalid = false;
  queValid = false;
  comoInvalid = false;
  comoValid = false;
  quienInvalid = false;
  quienValid = false;
  cuandoInvalid = false;
  cuandoValid = false;

  descripcionInvalid = false;
  descripcionValid = false;

  descripcionControlesInternosPlanInvalid = false;
  descripcionControlesInternosPlanValid = false;

  formCreatePlanRiesgo = new FormGroup({
    id_prioridad: new FormControl('', Validators.required),
    id_puesto_responsable: new FormControl('', Validators.required),
    fecha_inicio: new FormControl('', Validators.required),
    fecha_fin: new FormControl('', Validators.required),
    comentario: new FormControl(''),
    usuario_registro: new FormControl(''),
  })
  formCreateControlImplementacion = new FormGroup({
    que: new FormControl('', Validators.required),
    como: new FormControl('', Validators.required),
    quien: new FormControl('', Validators.required),
    cuando: new FormControl('', Validators.required),
    usuario_registro: new FormControl(''),
  })
  formCreateRecursos = new FormGroup({
    descripcion: new FormControl('', Validators.required),
    usuario_registro: new FormControl('',),
  })
  formCreateControlesInternosPlan = new FormGroup({
    descripcion: new FormControl('', Validators.required),
    usuario_registro: new FormControl('',),
  })

  controlImplementacionMemory: any = []
  recursosMemory: any = []
  id_riesgo_plan_trabajo: any = 0;
  id_matriz: string | null = null;
  controlInternoPlanMemory: any = [];
  showTableControlInternoPlan: any = false;

  constructor(
    private planRiesgoService: PlanRiesgosService,
    private catalogosService: CatalogosService,
    private riesgosService: RiesgosService,
    private route: ActivatedRoute,
    private router: Router,
    private usuarioService: UsuarioService,
    private utilidades: UtilidadesService,
    private matrizService: MatrizService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(param => {
      this.id_riesgo = param.get('id_riesgo');
      this.id_matriz = param.get('id_matriz');
      this.linkPlan = `/admin/riesgos/${this.id_matriz}`
      this.riesgosService.getRiesgoById(this.id_riesgo).subscribe(riesgoObtenido => {
        this.riesgo = riesgoObtenido[0]
      })
    })
    this.catalogosService.getPrioridad().subscribe(prioridad => this.prioridades = prioridad)
    this.catalogosService.getPuestoResponsable().subscribe(puesto => this.puestos = puesto)
    this.usuarioService.obtenerUsuario().subscribe((result: any) => this.usuario = result)
    this.matrizService.getMatrizById(this.id_matriz).subscribe(result => {
      this.periodoObtenido = result
      const fechaInicio = this.periodoObtenido[0].fecha_periodo_inicio.split('-');
      const anioInicio = fechaInicio[0]
      this.myDpOptions = {
        dateRange: false,
        dateFormat: 'dd/mm/yyyy',
        disableUntil: {
          year: parseInt(anioInicio) - 1,
          month: 12,
          day: 31,
        },
      }
      this.myDpOptions2 = {
        dateRange: false,
        dateFormat: 'dd/mm/yyyy',
        disableUntil: {
          year: parseInt(anioInicio) - 1,
          month: 12,
          day: 31,
        },
      }
      // this.formCreatePlanRiesgo.get('fecha_inicio')?.disable();
    })

    //validacion de formulario
    this.formCreatePlanRiesgo.get('id_prioridad')?.valueChanges.subscribe((value: any) => {
      if (this.prioridadInvalid && this.formCreatePlanRiesgo.get('id_prioridad')?.dirty) {
        this.prioridadValid = true
        this.prioridadInvalid = false
      }
    })
    this.formCreatePlanRiesgo.get('id_puesto_responsable')?.valueChanges.subscribe((value: any) => {
      if (this.puestoInvalid && this.formCreatePlanRiesgo.get('id_puesto_responsable')?.dirty) {
        this.puestoValid = true
        this.puestoInvalid = false
      }
    })
    this.formCreatePlanRiesgo.get('fecha_inicio')?.valueChanges.subscribe((value: any) => {
      this.formCreatePlanRiesgo.get('fecha_fin')?.reset();
      this.myDpOptions2 = {
        dateRange: false,
        dateFormat: 'dd/mm/yyyy',
        disableUntil: {
          year: value.singleDate.date.year,
          month: value.singleDate.date.month,
          day: value.singleDate.date.day,
        },
      }
      if (this.fechaInicioInvalid && this.formCreatePlanRiesgo.get('fecha_inicio')?.dirty) {
        this.fechaInicioValid = true
        this.fechaInicioInvalid = false
      }
    })
    this.formCreatePlanRiesgo.get('fecha_fin')?.valueChanges.subscribe((value: any) => {
      if (this.fechaFinInvalid && this.formCreatePlanRiesgo.get('fecha_fin')?.dirty) {
        this.fechaFinValid = true
        this.fechaFinInvalid = false
      }
    })

    //validacion controles
    this.formCreateControlImplementacion.valueChanges.subscribe((value: any) => {
      if ((this.queInvalid || this.comoInvalid || this.quienInvalid || this.cuandoInvalid) && this.controlImplementacionMemory.length > 0) {
        this.queValid = true
        this.comoValid = true
        this.quienValid = true
        this.cuandoValid = true
        this.queInvalid = false
        this.comoInvalid = false
        this.quienInvalid = false
        this.cuandoInvalid = false
      }
    })
    //recursos
    this.formCreateRecursos.get('descripcion')?.valueChanges.subscribe((value: any) => {
      if (this.descripcionInvalid && this.recursosMemory.length > 0) {
        this.descripcionValid = true
        this.descripcionInvalid = false
      }
    })

    this.formCreateControlesInternosPlan.get('descripcion')?.valueChanges.subscribe((value: any) => {
      if (this.descripcionControlesInternosPlanInvalid && this.controlInternoPlanMemory.length > 0) {
        this.descripcionControlesInternosPlanValid = true
        this.descripcionControlesInternosPlanInvalid = false
      }
    })
  }

  createNewPlanRiesgo() {
    const newRiesgoPlan = {
      ...this.formCreatePlanRiesgo.value,
      id_riesgo: this.id_riesgo,
      fecha_inicio: this.formCreatePlanRiesgo.value.fecha_inicio.singleDate.formatted,
      fecha_fin: this.formCreatePlanRiesgo.value.fecha_fin.singleDate.formatted,
      usuario_registro: this.usuario.id_usuario
    }
    this.planRiesgoService.createPlanRiesgo(newRiesgoPlan).subscribe((value) => {
      this.id_riesgo_plan_trabajo = value;

      this.recursosMemory.map((recursosObt: any) => {
        const recursos = {
          ...recursosObt,
          id_riesgo_plan_trabajo: this.id_riesgo_plan_trabajo,
          usuario_registro: this.usuario.id_usuario,
        }
        this.planRiesgoService.createRecurso(recursos).subscribe(value => {
        })
      })


      this.controlInternoPlanMemory.map((controlesObt: any) => {
        const controlesInternosPlan = {
          ...controlesObt,
          id_riesgo_plan_trabajo: this.id_riesgo_plan_trabajo,
          usuario_registro: this.usuario.id_usuario,
        }
        this.planRiesgoService.createControlInternoPlan(controlesInternosPlan).subscribe(value => {
        })
      })

      this.controlImplementacionMemory.map((controlObt: any) => {
        const newControlesImp = {
          ...controlObt,
          id_riesgo_plan_trabajo: this.id_riesgo_plan_trabajo,
          usuario_registro: this.usuario.id_usuario
        }
        this.planRiesgoService.createControlImplementacion(newControlesImp).subscribe(value => {
        })
      })
      // this.router.navigate(['/admin/ingreso-continuidad', this.id_riesgo, this.id_matriz]);
      this.router.navigate(['/admin/riesgos/', this.id_matriz]);
      // Swal.fire({
      //   title: '¡El registro se guardó correctamente!',
      //   icon: 'success',
      //   confirmButtonColor: '#3085d6',
      //   confirmButtonText: 'Aceptar',
      // }).then((result) => {
      //   if (result.isConfirmed) {

      //   }
      // })
    })
  }

  validarFormPlanRiesgo() {
    //Plan
    if (this.formCreatePlanRiesgo.get('id_prioridad')?.invalid) {
      this.prioridadInvalid = true
    } if (this.formCreatePlanRiesgo.get('id_puesto_responsable')?.invalid) {
      this.puestoInvalid = true
    } if (this.formCreatePlanRiesgo.get('fecha_inicio')?.invalid) {
      this.fechaInicioInvalid = true
    } if (this.formCreatePlanRiesgo.get('fecha_fin')?.invalid) {
      this.fechaFinInvalid = true
    }

    //controles
    if (this.controlImplementacionMemory.length < 1) {
      this.queInvalid = true
      this.comoInvalid = true
      this.quienInvalid = true
      this.cuandoInvalid = true
    }
    //recursos
    if (this.recursosMemory.length < 1) {
      this.descripcionInvalid = true
    }

    if (this.controlInternoPlanMemory.length < 1) {
      this.descripcionControlesInternosPlanInvalid = true
    }


    if (this.controlImplementacionMemory.length < 1 || this.recursosMemory.length < 1 || this.controlInternoPlanMemory.length < 1 || this.formCreatePlanRiesgo.invalid) {
      this.utilidades.mostrarErrorNoti("Por favor llene los campos obligatorios")
    } else {
      // this.nextPagePlan = true
      this.createNewPlanRiesgo()
    }
  }

  createNewControlToMemory() {
    if (this.formCreateControlImplementacion.get('que')?.value || this.formCreateControlImplementacion.get('como')?.value || this.formCreateControlImplementacion.get('quien')?.value || this.formCreateControlImplementacion.get('cuando')?.value) {
      const newValue = {
        ...this.formCreateControlImplementacion.value,
        que: `- QUÉ: ${this.formCreateControlImplementacion.get('que')?.value}`,
        como: `- CÓMO: ${this.formCreateControlImplementacion.get('como')?.value}`,
        quien: `- QUIÉN: ${this.formCreateControlImplementacion.get('quien')?.value}`,
        cuando: `- CUÁNDO: ${this.formCreateControlImplementacion.get('cuando')?.value}`
      }
      this.controlImplementacionMemory.push(newValue)
      this.showTableControlImplementacion = true
      this.formCreateControlImplementacion.get('que')?.reset();
      this.formCreateControlImplementacion.get('como')?.reset();
      this.formCreateControlImplementacion.get('quien')?.reset();
      this.formCreateControlImplementacion.get('cuando')?.reset();
    }
  }

  deleteControlFromMemory(que: any, como: any, quien: any, cuando: any) {
    const id: any = this.controlImplementacionMemory.findIndex((control: any) => (control.que === que) && (control.como === como) && (control.quien === quien) && (control.cuando === cuando))
    this.controlImplementacionMemory.splice(id, 1)
  }

  createNewRecursoToMemory() {
    const newValue = {
      ...this.formCreateRecursos.value,
      descripcion: `- ${this.formCreateRecursos.get('descripcion')?.value}`
    }
    this.recursosMemory.push(newValue)
    this.formCreateRecursos.get('descripcion')?.reset();
    this.showTableRecursos = true
  }

  deleteRecursoFromMemory(descripcion: any) {
    const id = this.recursosMemory.findIndex((recurso: any) => recurso.descripcion === descripcion)
    this.recursosMemory.splice(id, 1)
  }

  createNewControlInternoPlanToMemory() {
    const newValue = {
      ...this.formCreateControlesInternosPlan.value,
      descripcion: `- ${this.formCreateControlesInternosPlan.get('descripcion')?.value}`
    }
    this.controlInternoPlanMemory.push(newValue)
    this.formCreateControlesInternosPlan.get('descripcion')?.reset();
    this.showTableControlInternoPlan = true
  }

  deleteControlInternoPlanFromMemory(descripcion: any) {
    const id = this.controlInternoPlanMemory.findIndex((control: any) => control.descripcion === descripcion)
    this.controlInternoPlanMemory.splice(id, 1)
  }
}
