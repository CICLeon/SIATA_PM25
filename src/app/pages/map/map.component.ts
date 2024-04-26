import { Component, inject } from '@angular/core';
import { SiataService } from '../../service/siata.service';
import { ISIATAPM25 } from '../../interfaces/siata';
import { geoJSON, Icon, Layer, Map, marker, tileLayer, latLng, circle } from 'leaflet';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrl: './map.component.css'
})
export class MapComponent {

  siataService = inject(SiataService)
  dataSiata : ISIATAPM25[] = []

  map : Map = {} as Map;

  selectDate : Date = new Date()
  dateMax : Date = new Date()
  dateMin : Date = new Date()

  markers : any[] = []

  ngOnInit(){
    this.siataService.getSIATAPM25().then(async (data : ISIATAPM25[]) => {
      let arrayDate = data.flatMap(x => x.datos.map(x => new Date(x.fecha).getTime()))
      let number = await this.setMaxMinDate(arrayDate)
      this.dateMax = new Date(number[0]);
      this.dateMin = new Date(number[1]);
      this.selectDate = this.dateMax
      this.dataSiata = data
      this.onSelectDate(false)
    })


  }

  setColor(value : number) : string{
    let result : string = ''
    if(value > 0 && value <= 50){
      result = '#91d23e'
    }else if(value > 50 && value <= 100){
      result = '#fce65e'
    }else if(value > 100 && value <= 150){
      result = '#f8803a'
    }else if(value > 150 && value <= 200){
      result = '#df3539'
    }else if(value > 200){
      result = '#53116a'
    }
    return result
  }

  async setMaxMinDate(dates : number[]) : Promise< number[]> {
    return new Promise((resp) => {
      let result : number[] = [0, 0]
      dates.forEach((x, index) => {
        if(index === 0){
          result[0] = x
          result[1] = x
        }else{
          if(x > result[0]){
            result[0] = x
          }
          if(x < result[1]){
            result[1] = x
          }
        }
        
      })
      return resp(result)
    })
  }

  calcAQI(value : number) : number{
    let result = 0
    if(value <= 12){
      result = ((50 - 0) / (12.0 - 0)) * (value - 0) + 0
    }else if(value > 12 && value <= 35.4){
      result = ((100 - 51) / (35.4 - 12.1)) * (value - 12.1) + 51
    }else if(value > 35.4 && value <= 55.4){
      result = ((150 - 101) / (55.4 - 35.5)) * (value - 35.5) + 101
    }else if(value > 55.4 && value <= 150.4){
      result = ((200 - 151) / (150.4 - 55.5)) * (value - 55.5) + 151
    }else if(value > 150.4 && value <= 250.4){
      result = ((300 - 201) / (250.4 - 150.5)) * (value - 150.5) + 201
    }else if(value > 250.4 && value <= 350.4){
      result = ((400 - 301) / (350.4 - 250.5)) * (value - 250.5) + 301
    }else if(value > 350.4 && value <= 500.4){
      result = ((500 - 401) / (500.4 - 350.5)) * (value - 350.5) + 401
    }
    return result
  }

  recommendationsAQI(value : number) : string {
    let result : string = ''
    if(value > 0 && value <= 50){
      result = 'La calidad del aire se clasifica como satisfactoria en este rango, indicando bajos niveles de contaminación. No se prevén consecuencias perjudiciales para la salud humana.'
    }else if(value > 50 && value <= 100){
      result = 'La calidad del aire se encuentra en un nivel moderado, lo que implica que la concentración de contaminantes es aceptable. Generalmente, esto no representa un peligro para la población; sin embargo, individuos con condiciones de salud preexistentes o sensibilidad a la contaminación atmosférica podrían requerir precauciones adicionales.'
    }else if(value > 100 && value <= 150){
      result = 'En la clasificación actual, la calidad del aire se considera "insalubre para grupos sensibles". Esto significa que hay una mayor probabilidad de que niños, personas mayores y aquellos con afecciones respiratorias crónicas experimenten efectos adversos para la salud. Se aconseja que estos grupos limiten su exposición al aire libre para reducir el riesgo de problemas de salud relacionados con la calidad del aire.'
    }else if(value > 150 && value <= 200){
      result = 'En la clasificación actual, la calidad del aire se considera insalubre. Esto significa que todos pueden experimentar efectos adversos para la salud. Se deben tomar medidas para reducir la exposición al aire contaminado.'
    }else if(value > 200){
      result = 'En la clasificación actual, la calidad del aire se considera "muy insalubre". Esto indica que los riesgos para la salud son significativos. Se deben tomar medidas urgentes para protegerse de los efectos adversos relacionados con la contaminación del aire.'
    }
    return result
  }

  // def calcular_aqi(pm25):
  //   if pm25 <= 12.0:
  //       aqi = ((50 - 0) / (12.0 - 0)) * (pm25 - 0) + 0
  //   elif pm25 <= 35.4:
  //       aqi = ((100 - 51) / (35.4 - 12.1)) * (pm25 - 12.1) + 51
  //   elif pm25 <= 55.4:
  //       aqi = ((150 - 101) / (55.4 - 35.5)) * (pm25 - 35.5) + 101
  //   elif pm25 <= 150.4:
  //       aqi = ((200 - 151) / (150.4 - 55.5)) * (pm25 - 55.5) + 151
  //   elif pm25 <= 250.4:
  //       aqi = ((300 - 201) / (250.4 - 150.5)) * (pm25 - 150.5) + 201
  //   elif pm25 <= 350.4:
  //       aqi = ((400 - 301) / (350.4 - 250.5)) * (pm25 - 250.5) + 301
  //   elif pm25 <= 500.4:
  //       aqi = ((500 - 401) / (500.4 - 350.5)) * (pm25 - 350.5) + 401
  //   else:
  //       aqi = None  # PM2.5 value is out of range
  //   return aqi



  averageAQI(values : number[]) : number{
    return values.reduce((a, b) => a + this.calcAQI(b), 0) / (values.length > 0 ? values.length : 1)
  }

  onSelectDate(flag : boolean){
    if(flag){
      this.map.remove()
    }
    this.map = new Map('map').setView([6.25184, -75.56359], 11);
    tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 17,
      attribution: '© OpenStreetMap, David Rivera Cordoba',
    }).addTo(this.map);
    if(this.dataSiata.length > 0){
      this.dataSiata.forEach(item => {
        item.datos = item.datos.filter(x => x.valor >= 0 && x.valor <= 500.4)
        if(item.datos.length > 0){
          item.marker = circle([item.latitud, item.longitud], {
            stroke: true,
            color: this.setColor(this.averageAQI(item.datos.filter(x => new Date(x.fecha) >= new Date(this.selectDate.getTime() - 86400000) && new Date(x.fecha) <= this.selectDate).map(x => x.valor))),
            fill : true,
            fillColor: this.setColor(this.averageAQI(item.datos.filter(x => new Date(x.fecha) >= new Date(this.selectDate.getTime() - 86400000) && new Date(x.fecha) <= this.selectDate).map(x => x.valor))),
            fillOpacity: 0.4,
            radius: 1500,
            fillRule : 'inherit'
          })
          .bindPopup(
            `
              <table border="1px" style="border-collapse: collapse;">
                <tr>
                    <td class="p-2 text-center text-base" colspan="2"><strong>${item.nombre}</strong></td>
                </tr>
                <tr>
                    <td class="p-2 text-center" >Calida</td>
                    <td class="p-2 text-center" >${item.datos[0].calidad}</td>
                </tr>
                <tr>
                    <td class="p-2 text-center" >Fecha</td>
                    <td class="p-2 text-center" >${new Date(item.datos[0].fecha).toLocaleString()}</td>
                </tr>
                <tr>
                    <td class="p-2 text-center" >Concentración promedio últimas 24 horas</td>
                    <td class="p-2 text-center" >${this.averageAQI(item.datos.filter(x => new Date(x.fecha) >= new Date(this.selectDate.getTime() - 86400000) && new Date(x.fecha) <= this.selectDate).map(x => x.valor)).toFixed(4)}</td>
                </tr>
                <tr>
                    <td class="p-2 text-center" >Recomendaciones</td>
                    <td class="p-2 text-justify" >${this.recommendationsAQI(this.averageAQI(item.datos.filter(x => new Date(x.fecha) >= new Date(this.selectDate.getTime() - 86400000) && new Date(x.fecha) <= this.selectDate).map(x => x.valor)))}</td>
                </tr>
              </table>
            `
          )
          .bindTooltip(item.nombreCorto, {direction: 'bottom'})
          .addTo(this.map);
        }
      })
    }
  }
}
