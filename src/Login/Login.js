import React, {Component} from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Card from '@material-ui/core/Card';
import Avatar from '@material-ui/core/Avatar';
import {createMuiTheme, MuiThemeProvider, withStyles} from '@material-ui/core/styles';
import LockIcon from '@material-ui/icons/Lock';
import {defaultTheme, Notification} from 'react-admin';
import DefaultLoginForm from './LoginForm';
import HelpIcon from '@material-ui/icons/Info';
import Button from '@material-ui/core/Button';
import AboutDialog from './AboutDialog';

const styles = theme => ({
  main: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    height: '1px',
    alignItems: 'center',
    justifyContent: 'flex-start'
  },
  card: {
    minWidth: 300,
    marginTop: '6em'
  },
  avatar: {
    margin: '1em',
    display: 'flex',
    justifyContent: 'center'
  },
  icon: {
    backgroundColor: theme.palette.secondary[500]
  },
  fab: {
    margin: theme.spacing.unit,
    position: 'absolute',
    right: 10,
    bottom: 10
  },
  extendedIcon: {
    marginRight: theme.spacing.unit
  }
});

const sanitizeRestProps = ({
  array,
  backgroundImage,
  classes,
  className,
  location,
  staticContext,
  theme,
  title,
  ...rest
}) => rest;

/**
 * A standalone login page, to serve as authentication gate to the admin
 *
 * Expects the user to enter a login and a password, which will be checked
 * by the `authProvider` using the AUTH_LOGIN verb. Redirects to the root page
 * (/) upon success, otherwise displays an authentication error message.
 *
 * Copy and adapt this component to implement your own login logic
 * (e.g. to authenticate via email or facebook or anything else).
 *
 * @example
 *     import MyLoginPage from './MyLoginPage';
 *     const App = () => (
 *         <Admin loginPage={MyLoginPage} authProvider={authProvider}>
 *             ...
 *        </Admin>
 *     );
 */
class Login extends Component {
  constructor (props) {
    super(props);
    this.theme = createMuiTheme(props.theme);
    this.containerRef = React.createRef();
    this.backgroundImageLoaded = false;
  }

  state = {
    open: false
  }
    // Even though the React doc ensure the ref creation is done before the
    // componentDidMount, it can happen that the ref is set to null until the
    // next render.
    // So, to handle this case the component will now try to load the image on
    // the componentDidMount, but if the ref doesn't exist, it will try again
    // on the following componentDidUpdate. The try will be done only once.
    // @see https://reactjs.org/docs/refs-and-the-dom.html#adding-a-ref-to-a-dom-element
    updateBackgroundImage = (lastTry = false) => {
      if (!this.backgroundImageLoaded && this.containerRef.current) {
        const {backgroundImage} = this.props;
        this.containerRef.current.style.backgroundImage = `url(${backgroundImage})`;
        this.backgroundImageLoaded = true;
      }

      if (lastTry) {
        this.backgroundImageLoaded = true;
      }
    };

    // Load background image asynchronously to speed up time to interactive
    lazyLoadBackgroundImage () {
      const {backgroundImage} = this.props;

      if (backgroundImage) {
        const img = new Image();
        img.onload = this.updateBackgroundImage;
        img.src = backgroundImage;
      }
    }

    componentDidMount () {
      this.lazyLoadBackgroundImage();
    }

    componentDidUpdate () {
      if (!this.backgroundImageLoaded) {
        this.lazyLoadBackgroundImage(true);
      }
    }
  handleClickOpen = () => {
    this.setState({
      open: true
    });
  };

  handleClose = () => {
    this.setState({open: false});
  };
  render () {
    const {classes, className, loginForm, ...rest} = this.props;

    return (
      <MuiThemeProvider theme={this.theme}>
        <div
          className={classnames(classes.main, className)}
          {...sanitizeRestProps(rest)}
          ref={this.containerRef}
        >
          <AboutDialog open={this.state.open} closeDialog={this.handleClose}/>
          <Card className={classes.card}>
            <div className={classes.avatar}>
              <Avatar className={classes.icon}>
                <LockIcon/>
              </Avatar>
            </div>
            {loginForm}
          </Card>
          <Notification/>
          <Button variant='fab' color='primary' aria-label='About' className={classes.fab} onClick={this.handleClickOpen}>
            <HelpIcon/>
          </Button>

        </div>
      </MuiThemeProvider>
    );
  }
}

Login.propTypes = {
  authProvider: PropTypes.func,
  backgroundImage: PropTypes.string,
  classes: PropTypes.object,
  className: PropTypes.string,
  input: PropTypes.object,
  loginForm: PropTypes.element,
  meta: PropTypes.object,
  previousRoute: PropTypes.string,
  theme: PropTypes.any
};

Login.defaultProps = {
  backgroundImage: '/background.png',
  theme: defaultTheme,
  loginForm: <DefaultLoginForm/>
};

export default withStyles(styles)(Login);
