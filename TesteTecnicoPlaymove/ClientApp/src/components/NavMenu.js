import React, { Component } from 'react';
import { Collapse, Container, Navbar, NavbarBrand, NavbarToggler, NavItem, NavLink } from 'reactstrap';
import { Link } from 'react-router-dom';
import './NavMenu.css';

const navBarTitle = 'Teste C# - Playmove';

const navBarItems = [
    { link: "/", text: "Home" },
    { link: "/fornecedores", text: "Fornecedores" }
];

export class NavMenu extends Component {
    static displayName = NavMenu.name;

    constructor(props) {
        super(props);
        this.toggleNavbar = this.toggleNavbar.bind(this);
        this.state = {
            collapsed: true
        };
    }

    toggleNavbar() {
        this.setState({
            collapsed: !this.state.collapsed
        });
    }

    render() {
        return (
            <header>
                <Navbar className="navbar-expand-sm navbar-toggleable-sm navbar-dark bg-dark ng-white border-bottom box-shadow mb-3" light>
                    <Container>
                        <NavbarBrand tag={Link} to="/">{navBarTitle}</NavbarBrand>
                        <NavbarToggler onClick={this.toggleNavbar} className="mr-2" />
                        <Collapse className="d-sm-inline-flex flex-sm-row" isOpen={!this.state.collapsed} navbar>
                            <ul className="navbar-nav flex-grow">
                                {navBarItems.map((navItem, index) => (
                                    <NavItem key={index}>
                                        <NavLink tag={Link} className="text-white" to={navItem.link}> {navItem.text} </NavLink>
                                    </NavItem>
                                ))}
                            </ul>
                        </Collapse>
                    </Container>
                </Navbar>
            </header>
        );
    }
}
