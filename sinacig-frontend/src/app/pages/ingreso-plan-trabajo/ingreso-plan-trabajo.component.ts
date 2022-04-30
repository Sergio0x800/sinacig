import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CatalogosService } from 'src/app/services/catalogos.service';
import { PlanRiesgosService } from 'src/app/services/plan-riesgos.service';
import { ActivatedRoute, Router } from '@angular/router';
import { RiesgosService } from 'src/app/services/riesgos.service';
import { IAngularMyDpOptions } from 'angular-mydatepicker';

import Swal from 'sweetalert2';


@Component({
  selector: 'app-ingreso-plan-trabajo',
  templateUrl: './ingreso-plan-trabajo.component.html',
  styleUrls: ['./ingreso-plan-trabajo.component.css']
})
export class IngresoPlanTrabajoComponent implements OnInit {

  //parametro enviado por url desde ingreso riesgos y riesgos
  id_riesgo: string | null = null;

  //configuracion de mydatepicker
  myDpOptions: IAngularMyDpOptions = {
    dateRange: false,
    dateFormat: 'yyyy-mm-dd'
  };
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


  linkPlan: string = '';
  showBtn: boolean = true;
  showOptions: boolean = false;

  formCreatePlanRiesgo = new FormGroup({
    id_prioridad: new FormControl('', Validators.required),
    id_puesto_responsable: new FormControl('', Validators.required),
    fecha_inicio: new FormControl('', Validators.required),
    fecha_fin: new FormControl('', Validators.required),
    comentario: new FormControl(''),
    usuario_registro: new FormControl('1', Validators.required),
  })
  formCreateControlImplementacion = new FormGroup({
    que: new FormControl(''),
    como: new FormControl(''),
    quien: new FormControl(''),
    cuando: new FormControl(''),
    usuario_registro: new FormControl('1', Validators.required),
  })
  formCreateRecursos = new FormGroup({
    descripcion: new FormControl('', Validators.required),
    usuario_registro: new FormControl('1', Validators.required),
  })

  controlImplementacionMemory: any = []
  recursosMemory: any = []
  id_riesgo_plan_trabajo: any = 0;
  id_matriz: string | null = null;

  constructor(
    private planRiesgoService: PlanRiesgosService,
    private catalogosService: CatalogosService,
    private riesgosService: RiesgosService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(param => {
      this.id_riesgo = param.get('id_riesgo');
      this.id_matriz = param.get('id_matriz')
      this.linkPlan = `/admin/riesgos/${this.id_matriz}`
      this.riesgosService.getRiesgoById(this.id_riesgo).subscribe(riesgoObtenido => {
        this.riesgo = riesgoObtenido[0]
      })
    })
    this.catalogosService.getPrioridad().subscribe(prioridad => this.prioridades = prioridad)
    this.catalogosService.getPuestoResponsable().subscribe(puesto => this.puestos = puesto)
  }

  createNewPlanRiesgo() {
    // this.formCreatePlanRiesgo.valueChanges.subscribe((value) => {
    //   parseInt(value.id_prioridad)
    //   parseInt(value.id_puesto_responsable)
    //   parseInt(value.usuario_registro)
    // })
    const newRiesgoPlan = {
      ...this.formCreatePlanRiesgo.value,
      id_riesgo: this.id_riesgo,
      fecha_inicio: this.formCreatePlanRiesgo.value.fecha_inicio.singleDate.formatted,
      fecha_fin: this.formCreatePlanRiesgo.value.fecha_fin.singleDate.formatted
    }
    this.planRiesgoService.createPlanRiesgo(newRiesgoPlan).subscribe((value) => {
      this.id_riesgo_plan_trabajo = value;
      Swal.fire({
        title: '¡El registro se guardo correctamente!',
        icon: 'success',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK!',
      }).then((result) => {
        if (result.isConfirmed) {
          this.recursosMemory.map((recursosObt: any) => {
            const recursos = {
              ...recursosObt,
              id_riesgo_plan_trabajo: this.id_riesgo_plan_trabajo
            }
            this.planRiesgoService.createRecurso(recursos).subscribe(value => {
            })
          })
          this.controlImplementacionMemory.map((controlObt: any) => {
            const newControlesImp = {
              ...controlObt,
              id_riesgo_plan_trabajo: this.id_riesgo_plan_trabajo
            }
            this.planRiesgoService.createControlImplementacion(newControlesImp).subscribe(value => {
            })
          })
          this.router.navigate(['/admin/riesgos/', this.id_matriz]);
        }
      })
    })
  }

  createNewControlToMemory() {
    if (this.formCreateControlImplementacion.get('que')?.value || this.formCreateControlImplementacion.get('como')?.value || this.formCreateControlImplementacion.get('quien')?.value || this.formCreateControlImplementacion.get('cuando')?.value) {
      this.controlImplementacionMemory.push(this.formCreateControlImplementacion.value)
      this.showTableControlImplementacion = true
      this.formCreateControlImplementacion.get('que')?.reset();
      this.formCreateControlImplementacion.get('como')?.reset();
      this.formCreateControlImplementacion.get('quien')?.reset();
      this.formCreateControlImplementacion.get('cuando')?.reset();
    }
  }

  deleteControlFromMemory(que: any, como: any, quien: any, cuando: any) {
    const id: any = this.controlImplementacionMemory.find((control: any) => (control.que === que) && (control.como === como) && (control.quien === quien) && (control.cuando === cuando))
    this.controlImplementacionMemory.splice(id, 1)
  }

  createNewRecursoToMemory() {
    this.recursosMemory.push(this.formCreateRecursos.value)
    this.formCreateRecursos.get('descripcion')?.reset();
    this.showTableRecursos = true
  }

  deleteRecursoFromMemory(descripcion: any) {
    const id = this.recursosMemory.find((recurso: any) => recurso.descripcion === descripcion)
    this.recursosMemory.splice(id, 1)
  }
}
