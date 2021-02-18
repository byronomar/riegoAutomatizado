import React from "react";
import {
  MDBContainer,
  MDBCol,
  MDBInput,
  MDBBtn,
  toast,
  ToastContainer,
} from "mdbreact";
import "./styles/Login.css";
import * as ROUTES from "../../constants/routes";
import SectionContainer from '../components/sectionContainer';
import { withFirebase } from '../../bloc/Firebase';
import { compose } from 'recompose';
import { withRouter } from 'react-router-dom';

class Login extends React.Component {
  state = {
    current_user: {}
  };

  handleChange = e =>{
    this.setState({
      current_user: {
        ...this.state.current_user,
        [e.target.name]: e.target.value,
      },

    });
  }

  handleSignIn = () =>{
    const { email, password } = this.state.current_user;
    if(email === "" || password === ""){
      toast.warning('Complete todos los campos', {
        position: 'top-right'
      });
      return;
    }
    this.props.firebase
      .doSignInWithEmailAndPassword(email, password)
      .then((result) => {
        if(result){
         if(!result.user.emailVerified){
          this.props.doSendEmailVerification();
         }
          toast.info('Bienvenido', {
            position: 'top-right'
          });  
        this.props.history.push(ROUTES.HOME);

        }else{
          toast.info('Email o contraseña incorrectos', {
            position: 'top-right'
          });
          this.props.firebase.auth.signOut();
        }
      })
      .catch(error => {
        toast.warning(error.message, {
          position: 'top-right'
        });
      });
  }

  render() {
    return (
      <div>
        <MDBContainer className="mt-5">
                <SectionContainer header="" className="row" noBorder flexCenter flexCenterVert>
                    <MDBCol md="6">
                        <SectionContainer >
                            <form>
                            <p className='h5 text-center mb-4'>Iniciar sesión</p>
                            <div className='grey-text'>
                            <MDBInput
                                label='Email'
                                icon='envelope'
                                group
                                type='email'
                                validate
                                error='wrong'
                                success='right'
                                name = "email"
                                onChange = {this.handleChange}
                            />
                            <MDBInput
                                label='Contraseña'
                                icon='lock'
                                group
                                type='password'
                                validate
                                name = "password"
                                onChange = {this.handleChange}
                            />
                            </div>
                            <div className='text-center'>
                            <MDBBtn onClick= {this.handleSignIn}>
                              Login
                            </MDBBtn>
                            </div>
                        </form>
                        
                        </SectionContainer>
                    </MDBCol>
                </SectionContainer>
                
        
        </MDBContainer>
        <ToastContainer
          hideProgressBar={true}
          newestOnTop={true}
          autoClose={5000}
        />

      </div>
        
    );
  }
}

export default compose(withRouter, withFirebase)(Login);