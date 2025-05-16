'use strict';

(function() {

  class MainController {

    constructor($http, $scope,Modal,Auth) {
      this.http = $http;
      this.scope=$scope;
      this.Auth=Auth;
      this.Modal=Modal;
      this.dailyPfrs=[];
      this.complete=false;
      this.processing=false;
      this.filename="nofilename.csv";
      //this.socket = socket;
      this.awesomeThings = [];
      this.aircraftCodes=[{ac:'Beech 1900',code: '405',payload:'5000',seats:'9'},
                          {ac:'AStar', code:'340',payload:'1000',seats:'3'},
                          {ac:'King Air', code:'406',payload:'2400',seats:'9'},
                          {ac:'Caravan', code:'415',payload:'3500',seats:'9'},
                          {ac:'Casa', code: '412',payload:'5250',seats:'0'},
                          {ac:'Courier',code: '421',payload:'6000',seats:'0'},
                          {ac:'MD500',code: '355',payload:'1000',seats:'3'},
                          {ac:'R44',code: '360',payload:'1000',seats:'3'},
                          {ac:'UH-1H',code: '317',payload:'1000',seats:'3'}];
      //$scope.$on('$destroy', function() {
        //socket.unsyncUpdates('thing');
      //});
    }

    $onInit() {
      this.date=new Date();
      this.dateStringFormatted=this.date.toLocaleDateString();
      this.setPfrs();
      this.tfliteModal=this.Modal.confirm.takeflite();
      this.showlegsModal=this.Modal.confirm.showlegs();
      this.http.post('/api/sources/collection',{collection:'aircraft'}).then(res=>{console.log(res.data)});
      this.http.post('/api/sources/daysPfrs',{value:'5/14/2025'}).then(res=>{console.log(res.data)});
      this.http.post('/api/sources/tfFlights',{date:'5/12/2025'}).then(res=>{console.log(res.data.flights)});
      this.http.get('/api/things')
        .then(response => {
          this.awesomeThings = response.data;
          //this.socket.syncUpdates('thing', this.awesomeThings);
        });
    }
    
    showLegs(pfr){
      console.log(pfr);
      this.showlegsModal(pfr);
    }
    
    takeFlite(pfr){
      this.http.post('/api/sources/tfFlight',{flightNum:pfr.flightNumber,date:this.dateStringFormatted}).then(res=>{
        console.log(res.data);
        this.tfliteModal(res.data.flight);
        
      }).catch(err=>{console.log(err)});
      
    }
    
    setPfrs(){
      this.http.post('/api/sources/daysPfrs',{value:this.dateStringFormatted}).then(res=>{
        this.dailyPfrs=res.data.sort((a,b)=>{
          return a.pilotEmployeeNumber*1-b.pilotEmployeeNumber*1||a._id.localeCompare(b._id)});
      })
      .catch(err=>{console.log(err)});
    }
    
    upDate(isString){
      if (isString==='string') this.date=new Date(this.dateStringFormatted);
      else this.dateStringFormatted=this.date.toLocaleDateString();
      this.setPfrs();
    }

    addThing() {
      if (this.newThing) {
        this.http.post('/api/things', {
          name: this.newThing
        });
        this.newThing = '';
      }
    }

    deleteThing(thing) {
      this.http.delete('/api/things/' + thing._id);
    }
    
    dateFormat(date){
      let d=new Date();
      if (date) d=new Date(date);
      let month = String(d.getMonth() + 1).padStart(2, '0');
      let day = String(d.getDate()).padStart(2, '0');
      let year = String(d.getFullYear()).slice(-2);
      return month+'/'+day+'/'+year;
    }
    
    async t100(){
      this.complete=false;
      this.processing=true;
      let aircraft=[];
      try {
        aircraft=await this.http.post('/api/sources/collection',{collection:'aircraft'});
        aircraft=aircraft.data;
      }
      catch(err){
        console.log(err);
      }
      let date = new Date(this.date);
      //let firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
      let lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      let month=date.getMonth() + 1;
      if (month<10) month='0'+month;
      this.filename='8E_Seg'+date.getFullYear()+'_'+month+'_'+lastDay.getDate()+'.csv';
      this.CSV='DATA TYPE,ENTITY CODE,YEAR,MONTH,ORIG AIRPORT,DEST AIRPORT,SERVICE CLASS,AIRCRAFT TYPE,CABINCONFIG,DEPARTURESPERF,AVAILABLEPAYLOAD,AVAILABLESEATS,SEGPASSENGERS,SEG FREIGHT,SEG MAIL,SCHED DEPARTURES,R TO R MINUTES,AIRB MINUTES\r\n';
      for (let x=1;x<=lastDay.getDate();x++){
        let d=new Date(date.getFullYear(), date.getMonth(), x);
        let dateString=this.dateFormat(d);
        this.dString=dateString;
        let pfrs=[];
        let flights=[];
        try {
          pfrs=await this.http.post('/api/sources/daysPfrs',{value:dateString});
          pfrs=pfrs.data;
        }
        catch(err){
          console.log(err);
        }
        try{
          flights=await this.http.post('/api/sources/tfFlights',{date:dateString});
          flights=flights.data.flights;
        }
        catch(err){
          console.log(err);
        }
        //iterate through each PFR in the day (res.data)
        pfrs.forEach(pfr=>{
          let flight={};
          let index=flights.map(e=>e.flightNumber).indexOf(pfr.flightNumber);
          if (index>-1) flight=flights[index];
          pfr.legArray.forEach((leg,i)=>{
            if (!leg.legTime||leg.legTime===0) return;
            let airborneTime=leg.legTime*1-4;
            if (airborneTime<0) airborneTime=0;
            let ac='';
            let code='415';
            let payload='3500';
            let seats='9';
            let aircraftIndex=aircraft.map(e=>e._id).indexOf(pfr.acftNumber);
            if (aircraftIndex>-1) {
              ac=aircraft[aircraftIndex];
              aircraftIndex=this.aircraftCodes.map(e=>e.ac).indexOf(ac.acftType);
              if (aircraftIndex>-1) {
                code=this.aircraftCodes[aircraftIndex].code;
                payload=this.aircraftCodes[aircraftIndex].payload;
                seats=this.aircraftCodes[aircraftIndex].seats;
              }
            }
            let flightLeg={};
            if (flight.flightLeg) {
              flight.flightLegs.every(fl=>{
                if (fl.origin.code===leg.dep&&fl.destination.code===leg.arr){
                  flightLeg=fl;
                  return false;
                }
                return true;
              });
            }
            this.CSV+='S,6992,'+d.getFullYear()+','+month+','+leg.dep+','+leg.arr;
            let serviceClass='L';
            if (pfr.flightNumber.length===4||pfr.flightNumber.substring(0,1)==='4'||pfr.flightNumber.substring(0,1)==='6'||pfr.flightNumber.substring(0,1)==='8'){
              serviceClass='F';
            }
            if (serviceClass==="L"&&code==="405") seats=19;
            this.CSV+=','+serviceClass+','+code+',1,1,'+payload+','+seats+',';
            this.CSV+=leg.paxNoLoad+','+leg.cargoLoad+','+leg.mailLoad+',0,'+leg.legTime+','+airborneTime+'\r\n';
            
          });
          
        });
        //iterate through each leg of the PFR
        
        //add segment Data to CSV, also create a JSON variable
        
        //something something Market CSV
        
      }
      this.complete=true;
      this.processing=false;
      console.log(this.CSV);
      let blob = new Blob([ this.CSV ], { type : 'text/plain' });
      this.url = (window.URL || window.webkitURL).createObjectURL( blob );
      this.scope.$apply();
      console.log(this.processing);
    }
  }

  angular.module('node10App')
    .component('main', {
      templateUrl: 'app/main/main.html',
      controller: MainController,
      controllerAs: 'main'
    });
})();
