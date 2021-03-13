import React from "react";
import {
    MDBRow,
    MDBCol,
    MDBCard,
    MDBCardBody,
    MDBProgress,
    MDBNavbar,
    MDBNavbarBrand,
    MDBNavbarNav,
    MDBIcon,
    MDBDropdown,
    MDBDropdownToggle,
    MDBDropdownMenu,
    MDBDropdownItem,
    MDBBtn,
    MDBInput,
} from 'mdbreact';
import SectionContainer from "../components/sectionContainer";

import { compose } from 'recompose';
import { withFirebase } from '../../bloc/Firebase';
import { withAuthorization, withEmailVerification } from '../../bloc/Session';

import { Connector, subscribe } from 'react-mqtt-client';

class Home extends React.Component{

  render(){
    const navStyle = {
      paddingLeft: this.props.toggle ? '16px' : '240px',
      transition: 'padding-left .3s'
    };
    return (
        
            <div className='flexible-content white-skin'>
              <MDBNavbar
                  className='flexible-MDBNavbar'
                  light
                  expand='md'
                  scrolling
                  fixed='top'
                  style={{ zIndex: 3 }}
                >

                <MDBNavbarBrand href='/' style={navStyle}>
                  <strong>{this.props.routeName}</strong>
                </MDBNavbarBrand>
                <MDBNavbarNav expand='sm' style={{ flexDirection: 'row' }}>

                

                <h3>SISTEMA DE RIEGO AUTOMÁTICO</h3>
                 <img height="55px" alt = "logo" src= "https://firebasestorage.googleapis.com/v0/b/sistemadriego.appspot.com/o/logo-UISRAEL.png?alt=media&token=8524a673-9e26-4cd2-855a-69aeda880d7d" ></img>
                  
                  
                <MDBDropdown>
                    <MDBDropdownToggle nav caret>
                      <MDBIcon icon='user' />{' '}
                      <span className='d-none d-md-inline'>Perfil</span>
                    </MDBDropdownToggle>
                    <MDBDropdownMenu right style={{ minWidth: '200px' }}>
                      <MDBDropdownItem 
                        onClick={()=>{
                          this.props.firebase.doSignOut();
                        }}
                      > Cerrar sesión
                      </MDBDropdownItem>
                    </MDBDropdownMenu>
                  </MDBDropdown>
                  
                </MDBNavbarNav>
              </MDBNavbar>

              <React.Fragment>
                <Connector
                  mqttProps={{
                      url: 'wss://broker.emqx.io:8084/mqtt',
                      options: { protocol: 'wss' }, // see MQTTjs options
                  }}
                >
                  <Connected />
                </Connector>
              </React.Fragment>
            </div>
          
     );
  }
}

class SistemaRiego extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      windowWidth: 0,
      breakWidth: 1400,
      isSystemOnline: true,
      medidasRemotas: {
        'humedad_1m': 0.0,
        'humedad_2m': 0.0,
        'humedad_m': 0.0,
        'humedad_m_max': 0.0,
        'humedad_m_min': 0.0,
        'estado_bomba_m': false,

        'humedad_1c': 0.0,
        'humedad_2c': 0.0,
        'humedad_c': 0.0,
        'humedad_c_max': 0.0,
        'humedad_c_min': 0.0,
        'estado_bomba_c': false,

        'temperatura_ambiente': 0.0,
        'humedad_ambiente': 0.0,
        'nivel_agua': 0.0,
      }, 
      configuraciones:{
        'humedad_m_max': 0.0,
        'humedad_m_min': 0.0,
        'humedad_c_min': 0.0,
        'humedad_c_max': 0.0,
      }
    };
  }

  pub_topic_inicio = '/SistemaRiego/MedidasRemotas/Inicio';
  pub_topic_riego = '/SistemaRiego/MedidasRemotas/Riego';
  pub_topic_configuraciones = '/SistemaRiego/MedidasRemotas/Configuraciones';
  pub_topic_actualizar = '/SistemaRiego/MedidasRemotas/Actualizar';

  componentDidMount(){
    this.props.mqtt.publish(this.pub_topic_inicio, 'inicio');
  }

  handleChangeConfig = e =>{
    this.setState({
      configuraciones: {
        ...this.state.configuraciones,
        [e.target.name]: parseInt(e.target.value),
      },
    });
  }

  handleSaveConfigurations = (cultivo) => {
    var configuraciones = this.state.configuraciones;
    configuraciones.cultivo = cultivo;
    this.props.mqtt.publish(this.pub_topic_configuraciones, JSON.stringify(configuraciones));
  }

  RiegoRemoto(cultivo){
    this.props.mqtt.publish(this.pub_topic_riego, cultivo);
  }

  actualizarLecturas(){
    this.props.mqtt.publish(this.pub_topic_actualizar);
  }
  
  render(){
    var datos = this.props.data[0];
    //console.log(datos);

    const dynamicLeftPadding = {
      paddingLeft:
        this.state.windowWidth > this.state.breakWidth ? '240px' : '0'
    };
    
    const SistemaRiego = (datos) =>{
      //console.log(datos)
      if(datos!==undefined){
        return <div>
          <main style={{ ...dynamicLeftPadding, margin: '8rem 6% 6rem' }}>

            <MDBRow around>
              <MDBCol xl='3' md='6' className='mb-5'>
                <MDBCard cascade className='cascading-admin-card'>
                  <div className='admin-up'>
                    <MDBIcon icon="water" className='primary-color mr-3 z-depth-2'
                    />
                    <div className='data'>
                      <p>HUMEDAD AMBIENTE</p>
                      <h4 className='font-weight-bold dark-grey-text'>{datos.humedad_ambiente}%</h4>
                    </div>
                  </div>
                  <MDBCardBody cascade>
                    <MDBProgress
                      value={datos.humedad_ambiente}
                      barClassName='bg-primary'
                      height='6px'
                      wrapperStyle={{ opacity: '.7' }}
                      className='mb-3'
                    />
                  </MDBCardBody>
                </MDBCard>
              </MDBCol>


              <MDBCol xl='3' md='6' className='mb-5'>
                <MDBCard cascade className='cascading-admin-card'>
                  <div className='admin-up'>
                    <MDBIcon icon='thermometer-half' className='warning-color' />
                    <div className='data'>
                      <p>TEMPERATURA AMBIENTE</p>
                      <h4 className='font-weight-bold dark-grey-text'>{datos.temperatura_ambiente}ºC</h4>
                    </div>
                  </div>
                  <MDBCardBody cascade>
                    <MDBProgress
                      value={datos.temperatura_ambiente}
                      barClassName='warning-color'
                      height='6px'
                      wrapperStyle={{ opacity: '.7' }}
                      className='mb-3'
                    />
                    {/* <p className='card-text'>Worse than last week (25%)</p> */}
                  </MDBCardBody>
                </MDBCard>
              </MDBCol>

              <MDBCol xl='3' md='6' className='mb-5'>
                <MDBCard cascade className='cascading-admin-card'>
                  <div className='admin-up'>
                    <MDBIcon icon='fill-drip' className='primary-color' />
                    <div className='data'>
                      <p>RESERVA DE AGUA</p>
                      <h4 className='font-weight-bold dark-grey-text'>{datos.nivel_agua}%</h4>
                    </div>
                  </div>

                  <MDBCardBody cascade>
                    <MDBProgress
                      value = {datos.nivel_agua}
                      barClassName='bg-primary'
                      height='6px'
                      wrapperStyle={{ opacity: '.7' }}
                      className='mb-3'
                    />
                  </MDBCardBody>
                </MDBCard>
              </MDBCol>
            </MDBRow>
            
            <MDBRow>
              <MDBCol xl='6' md='6' className='mb-5'>
              <SectionContainer header="CULTIVO DE COLIFLOR">
                  <MDBCard cascade className='cascading-admin-card'>
                    <div className='admin-up'>
                      <MDBIcon icon='spa' className='green' />
                      <div className='data'>
                        <p>HUMEDAD DEL SUELO</p>
                        <h4 className='font-weight-bold dark-grey-text'>{datos.humedad_c}</h4>
                      </div>
                    </div>

                    <MDBCardBody cascade>
                      <MDBProgress
                        value={datos.humedad_c}
                        barClassName='bg-primary'
                        height='6px'
                        wrapperStyle={{ opacity: '.7' }}
                        className='mb-3'
                      />
                      <p className='card-text'>Medidas: {datos.humedad_1c}%, {datos.humedad_2c}% </p>
                      <MDBRow around>
                        <MDBBtn 
                          onClick= {() => {
                            this.RiegoRemoto("C");
                          }}
                          color = 'blue'
                        >
                          Riego remoto
                        </MDBBtn>

                        <MDBBtn 
                          color = {datos.estado_bomba_c?'yellow':'grey'}
                        >
                          {datos.estado_bomba_c?'ON':'OFF'}
                        </MDBBtn>
                      </MDBRow>

                      <p className='card-text'>Parámetros de control automático </p>
                      <MDBRow around>
                        <MDBInput
                            label={`Humedad mín (${datos.humedad_c_min})`}
                            group
                            type='number'
                            validate
                            name = "humedad_c_min"
                            valueDefault = {datos.humedad_c_min}
                            value = {this.state.configuraciones.humedad_c_min}
                            onChange = {this.handleChangeConfig}
                        />
                        <MDBInput
                            label={`Humedad máx (${datos.humedad_c_max})`}
                            group
                            type='number'
                            validate
                            name = "humedad_c_max"
                            value = {this.state.configuraciones.humedad_c_max}
                            onChange = {this.handleChangeConfig}
                        />
                      </MDBRow>

                      <MDBRow end>
                        <MDBBtn 
                          onClick= {()=>{
                            this.handleSaveConfigurations("C")
                          }}
                          color = 'green'
                          disabled = {
                            (datos.humedad_c_min === this.state.configuraciones.humedad_c_min &&
                            datos.humedad_c_max === this.state.configuraciones.humedad_c_max) ||
                            this.state.configuraciones.humedad_c_max <= this.state.configuraciones.humedad_c_min
                          }
                        >
                          Guardar cambios
                        </MDBBtn>
                      </MDBRow>


                    </MDBCardBody>
                  </MDBCard>
              </SectionContainer>

              </MDBCol>
            
              <MDBCol xl='6' md='6' className='mb-5'>
              <SectionContainer header="CULTIVO DE MAIZ">
                  <MDBCard cascade className='cascading-admin-card'>
                    <div className='admin-up'>
                      <MDBIcon icon='spa' className='green' />
                      <div className='data'>
                        <p>HUMEDAD DEL SUELO</p>
                        <h4 className='font-weight-bold dark-grey-text'>{datos.humedad_m}</h4>
                      </div>
                    </div>

                    <MDBCardBody cascade>
                      <MDBProgress
                        value={datos.humedad_m}
                        barClassName='bg-primary'
                        height='6px'
                        wrapperStyle={{ opacity: '.7' }}
                        className='mb-3'
                      />
                      <p className='card-text'>Medidas: {datos.humedad_1m}%, {datos.humedad_2m}% </p>
                      <MDBRow around>
                        <MDBBtn 
                          onClick= {()=>{
                            this.RiegoRemoto("M");
                          }}
                          color = 'blue'
                        >
                          Riego remoto
                        </MDBBtn>

                        <MDBBtn 
                          color = {datos.estado_bomba_m?'yellow':'grey'}
                        >
                          {datos.estado_bomba_m?'ON':'OFF'}
                        </MDBBtn>
                      </MDBRow>

                      <p className='card-text'>Parámetros de control automático </p>
                      <MDBRow around>
                        <MDBInput
                            label={`Humedad mín (${datos.humedad_m_min})`}
                            group
                            type='number'
                            validate
                            name = "humedad_m_min"
                            value = {this.state.configuraciones.humedad_m_min}
                            onChange = {this.handleChangeConfig}
                        />
                        <MDBInput
                            label={`Humedad máx (${datos.humedad_m_max})`}
                            group
                            type='number'
                            validate
                            name = "humedad_m_max"
                            value = {this.state.configuraciones.humedad_m_max}
                            onChange = {this.handleChangeConfig}
                        />
                      </MDBRow> 

                      <MDBRow end>
                        <MDBBtn 
                          onClick= {()=>{
                            this.handleSaveConfigurations("M")
                          }}
                          color = 'green'
                          disabled = {
                            (datos.humedad_m_min === this.state.configuraciones.humedad_m_min &&
                            datos.humedad_m_max === this.state.configuraciones.humedad_m_max) ||
                            this.state.configuraciones.humedad_m_max <= this.state.configuraciones.humedad_m_min
                          }
                        >
                          Guardar cambios
                        </MDBBtn>
                      </MDBRow>


                    </MDBCardBody>
                  </MDBCard>
              </SectionContainer>

              </MDBCol>
            
            </MDBRow>

            <MDBBtn 
              onClick= {()=>{
                this.actualizarLecturas();
              }}
              color = 'green'
            >
              Actualizar
            </MDBBtn>

            <h3>Desarrollado por: Byron Gavilánez</h3>

            
          </main>
        </div>
      } else{
        return <div>
          <main style={{ ...dynamicLeftPadding, margin: '8rem 6% 6rem' }}>
            <h2>No se pudo realizar la conexión al sistema de riego automático</h2>
          </main>
        </div>
        
      }
    }

    return (
      <div>
        
        {SistemaRiego(datos)}

      </div>
    )
  }
}

const Connected = subscribe({ 
    topic: '/SistemaRiego/MedidasRemotas',
  })(SistemaRiego) 


const condition = authUser =>   authUser;
export default compose(
  withEmailVerification,
  withAuthorization(condition),
  withFirebase,
)(Home); 