
#include <DHT11.h>
DHT11 dht11(2);

//sensores de la coliflor
int sensor1c = A0;
int sensor2c = A1;

//sensores del maiz
int sensor1m = A2;
int sensor2m = A3;

//humedad actual y anterior coliflor
float humedad_c_ant = 0;
float humedad_c = 0;

//humedad actual y anterior maiz
float humedad_m_ant = 0;
float humedad_m = 0;

//sensor de nivel de agua
int trigger = 8;
int echo = 7;

//CONTROL DE RIEGO
int bomba_m = 5;
int bomba_c = 6;
int control_sensores = 3;

void setup() {
 Serial.begin(9600);
 
 //SALIDAS DIGITALES
 pinMode(bomba_c, OUTPUT);
 pinMode(bomba_m, OUTPUT);
 
 digitalWrite(bomba_c, LOW);
 digitalWrite(bomba_m, LOW);
 
 //sensor de nivel de agua
 pinMode(trigger, OUTPUT);
 digitalWrite(trigger, LOW);
 pinMode(echo, INPUT);
 
 
}

void loop() {  
  
  if(Serial.available()>0){
    
    String comando = Serial.readStringUntil('.');
    if(comando == "lecturas"){
      
      //encender sensores de humedad
      digitalWrite(control_sensores, HIGH);
      
      //medidas de humedad del suelo en coliflor
      float humedad1c = leerHumedad(sensor1c);
      float humedad2c = leerHumedad(sensor2c);
      humedad_c = (humedad1c + humedad2c)/2;
      
      //medidas de humedad del suelo en maiz
      float humedad1m = leerHumedad(sensor1m);
      float humedad2m = leerHumedad(sensor2m);
      humedad_m = (humedad1m + humedad2m)/2;
      
      //apagar sensores de humedad
      digitalWrite(control_sensores, LOW);
      
      
      //medidas de humedad ambiente y temperatura
      int err;
      float temp=0.0, hum=0.0;
      err = dht11.read(hum, temp);
      
      //medida de nivel de agua
      float nivel = leerNivelAgua();
      
      Serial.print(humedad1c);
      Serial.print(",");
      Serial.print(humedad2c);
      Serial.print(",");
      Serial.print(humedad_c);
      Serial.print(",");
      Serial.print(humedad1m);
      Serial.print(",");
      Serial.print(humedad2m);
      Serial.print(",");
      Serial.print(humedad_m);
      Serial.print(",");
      Serial.print(temp);
      Serial.print(",");
      Serial.print(hum);
      Serial.print(",");
      Serial.print(err);
      Serial.print(",");
      Serial.println(nivel);
      
    }else if(comando == "riego_c"){
      digitalWrite(bomba_c, HIGH);
      delay(200);
      digitalWrite(bomba_c, LOW);
      
    }else if(comando == "riego_m"){
      digitalWrite(bomba_m, HIGH);
      delay(200);
      digitalWrite(bomba_m, LOW);
    }
    
  }
  
 delay(100);

}

float leerHumedad(int sensor){
  //numero de muestras que debe tomar 
  int n=10;
  int sum = 0;
  for(int m=0; m<n; m++){
    sum += analogRead(sensor);
    delay(100);
  }
  sum = sum/n;
  float humedad = (1023-sum)*0.09775;
  return humedad;
}

float leerNivelAgua(){
  int n = 10;
  long d = 0;
  for(int k=0; k<n; k++){
    digitalWrite(trigger, HIGH);
    delayMicroseconds(10);          //Enviamos un pulso de 10us
    digitalWrite(trigger, LOW);
    long t = pulseIn(echo, HIGH);   //obtenemos el ancho del pulso
    d += t/59;
    delay(15);
  }
  d = d/n;
  //Serial.println(d);
  
  int dist_max = 9;
  int dist_min = 18;
  
  float m = 100/(dist_max - dist_min);
  float b = -m*dist_min;
  float nivel = m*d + b;
  
  if(nivel > 100){
    return 100;
  }else if(nivel<=0) {
    return 0;
  }
  return nivel;
}
