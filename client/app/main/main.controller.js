'use strict';

(function() {

  class MainController {

    constructor($http, $scope,Modal) {
      this.http = $http;
      this.Modal=Modal;
      this.dailyPfrs=[];
      //this.socket = socket;
      this.awesomeThings = [];

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
      //this.http.post('/api/sources/daysPfrs',{value:'5/14/2025'}).then(res=>{console.log(res.data)});
      //this.http.post('/api/sources/tfFlight',{flightNum:'850',date:'5/15/2025'}).then(res=>{console.log(res.data)});
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
  }

  angular.module('node10App')
    .component('main', {
      templateUrl: 'app/main/main.html',
      controller: MainController,
      controllerAs: 'main'
    });
})();
