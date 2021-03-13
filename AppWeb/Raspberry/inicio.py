import serial                      #comunicación serial con arduino
import time                        #retardos de tiempo
import json                        #formato de envio y recepcion de datos
import paho.mqtt.client as mqtt    #libreria mqtt
from urllib.request import urlopen

def wait_for_internet_connection():
    while True:
        try:
            response = urlopen("http://www.google.com/").read()
            print("internet acces")
            return
        except Exception:
            pass

wait_for_internet_connection()

#Conexión serial con arduino 
ser = serial.Serial('/dev/ttyUSB0', 9600, timeout=1)
ser.flush()

# Variables del sistema
humedad_1c = 0.0
humedad_2c = 0.0
humedad_c = 0.0
humedad_c_max = 0.0
humedad_c_min = 0.0 
estado_boma_c = False

humedad_1m = 0.0
humedad_2m = 0.0
humedad_m = 0.0
humedad_m_max = 0.0
humedad_m_min = 0.0 
estado_boma_m = False

temperatura_ambiente = 0.0
humedad_ambiente = 0.0
nivel_agua = 0.0

#banderas de control de riego en coliflor y maiz
bd_riego_c = False
bd_riego_m = False

#leer las configuraciones para el control de riego valores maximos y minimos de humedad de suelo
try:
    config_file = open("/home/pi/Documents/riego/rpi/control_riego/configuraciones.txt","r+")
    config = config_file.readline()
    config_array = config.split(',')
    humedad_c_min = float(config_array[0])
    humedad_c_max = float(config_array[1])
    humedad_m_min = float(config_array[2])
    humedad_m_max = float(config_array[3])
    config_file.close()
except Exception as e:
    print(e)


#Guardar las configuraciones recibidas desde la plataforma de monitoreo 
def guardarConfiguraciones(configuraciones):
    global humedad_c_max, humedad_c_min, humedad_m_max, humedad_m_min
    try:
        if configuraciones["cultivo"] == "C":
            humedad_c_min = configuraciones["humedad_c_min"]
            humedad_c_max = configuraciones["humedad_c_max"]
        
        if configuraciones["cultivo"] == "M":
            humedad_m_min = configuraciones["humedad_m_min"]
            humedad_m_max = configuraciones["humedad_m_max"]
            
        str_configuraciones = str(humedad_c_min) + "," + str(humedad_c_max) + "," + str(humedad_m_min) + "," + str(humedad_m_max)
            
        config_file = open("/home/pi/Documents/riego/rpi/control_riego/configuraciones.txt","w")
        config_file.write(str_configuraciones)
        config_file.close()

        publicarVariables()
    except Exception as e:
        print(e)

    
# Función que realiza el riego en el cultivo de coliflor
def riegoColiflor():
    global estado_boma_c

    estado_boma_c = True
    publicarVariables()
    ser.write(b"riego_c.")
    time.sleep(0.2)
    estado_boma_c = False
    publicarVariables()
    return

#Función que realiza el riego en el cultivo de maíz
def riegoMaiz():
    global estado_boma_m
    print("riego maiz")

    estado_boma_m = True
    publicarVariables()
    ser.write(b"riego_m.")
    time.sleep(0.2)
    estado_boma_m = False
    publicarVariables()
    
    return

#Función que leen las medidas de las variables desde Arduino
def leerMedidas ():
    global humedad_1c, humedad_2c, humedad_c, humedad_1m, humedad_2m, humedad_m, temperatura_ambiente, humedad_ambiente, nivel_agua
    
    ser.write(b"lecturas.")
    medidas = []

    t_inicio = time.time()
    while ser.in_waiting == 0:
        time.sleep(1)
        if time.time()-t_inicio > 10:
            print("Re open serial port")
            ser.close()
            ser.open()
            break

    if ser.in_waiting > 0:
        line = ser.readline().decode('utf-8').rstrip()
        medidas = line.split(',')

        if(len(medidas) == 10 ):
            #Humedad de suelo en coliflor
            humedad_1c = float(medidas[0])
            humedad_2c = float(medidas[1])
            humedad_c = float(medidas[2])

            #Humedad de suelo en maiz
            humedad_1m = float(medidas[3])
            humedad_2m = float(medidas[4])
            humedad_m = float(medidas[5])

            #Humedad y temperatura ambiente
            temperatura_ambiente = float(medidas[6])
            humedad_ambiente = float(medidas[7])

            #Nivel de agua
            nivel_agua = float(medidas[9])

    return 

#Publicar las medidas hacia la estación de monitoreo remoto usando el protocolo MQTT
def publicarVariables():
    global client
    global pub_topic
    global humedad_1c, humedad_2c, humedad_c, humedad_c_max, humedad_c_min, estado_boma_m, humedad_1m, humedad_2m, humedad_m, humedad_m_max, humedad_m_min, estado_boma_c, temperatura_ambiente, humedad_ambiente, nivel_agua
    
    medidas = {
        'humedad_1m': humedad_1m,
        'humedad_2m': humedad_2m,
        'humedad_m': humedad_m,
        'humedad_m_max': humedad_m_max,
        'humedad_m_min': humedad_m_min,
        'estado_bomba_m': estado_boma_m,

        'humedad_1c': humedad_1c,
        'humedad_2c': humedad_2c,
        'humedad_c': humedad_c,
        'humedad_c_max': humedad_c_max,
        'humedad_c_min': humedad_c_min,
        'estado_bomba_c': estado_boma_c,

        'temperatura_ambiente': temperatura_ambiente,
        'humedad_ambiente': humedad_ambiente,
        'nivel_agua': nivel_agua,
    }
    client.publish(pub_topic, json.dumps(medidas))
    #print(medidas)



# Mqtt
Broker = "broker.emqx.io"
sub_topic_inicio = "/SistemaRiego/MedidasRemotas/Inicio" 
sub_topic_riego = "/SistemaRiego/MedidasRemotas/Riego"
sub_topic_configuraciones = "/SistemaRiego/MedidasRemotas/Configuraciones"
sub_topic_actualizar = "/SistemaRiego/MedidasRemotas/Actualizar"
pub_topic = "/SistemaRiego/MedidasRemotas" 

# Evento de conexión al bloquear MQTT
def on_connect(client, userdata, flags, rc):
    print("Connected with result code "+str(rc))
    client.subscribe(sub_topic_inicio)
    client.subscribe(sub_topic_riego)
    client.subscribe(sub_topic_configuraciones)
    client.subscribe(sub_topic_actualizar)

# Evento de recepción de un nuevo mensaje MQTT
def on_message(client, userdata, msg):
    global sub_topic_inicio, sub_topic_riego, sub_topic_configuraciones, sub_topic_actualizar

    if msg.topic == sub_topic_inicio: 
        publicarVariables()

    if msg.topic == sub_topic_riego: 
        if(msg.payload.decode("utf-8")  == "C"):
            riegoColiflor()
            leerMedidas()
            publicarVariables()

        if(msg.payload.decode("utf-8")  == "M"):
            riegoMaiz()
            leerMedidas()
            publicarVariables()
    
    if msg.topic == sub_topic_configuraciones:
        configuraciones = json.loads(msg.payload.decode("utf-8"))
        guardarConfiguraciones(configuraciones)
    
    #if msg.topic == sub_topic_actualizar:
        #leerMedidas()
       # publicarVariables()


def on_publish(mosq, obj, mid):
    print("mid: " + str(mid))

# Configuración de un nuevo cliente MQTT
client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message
client.connect(Broker, 1883, 60)
client.loop_start()

while True:
    try:
        #Se activan las banderas de riego
        if humedad_c < humedad_c_min:
            bd_riego_c = True

        if humedad_m < humedad_m_min:
            bd_riego_m = True

        #Se desactivan las banderas de riego
        if humedad_c >= humedad_c_max:
            bd_riego_c = False

        if humedad_m >= humedad_m_max:
            bd_riego_m = False

        #Se ejecuta el riego
        if nivel_agua > 20:
            if bd_riego_c:
                print("regar coliflor")
                riegoColiflor()
            
            if bd_riego_m:
                print("regar maiz")
                riegoMaiz()
        

        leerMedidas()
        publicarVariables()

        time.sleep(60*5)
        
        
    except Exception as e:
        print(e)