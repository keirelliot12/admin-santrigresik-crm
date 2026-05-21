'use client'
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button, Col, Container, Form, InputGroup, Row, Alert } from 'react-bootstrap';
import { signIn } from 'next-auth/react';
import { useTheme } from '@/layout/theme-provider/theme-provider';

//Images
import jampackImg from '@/assets/img/logo-light.svg';
import jampackImgDark from '@/assets/img/logo-dark.svg';
import logoutImg from '@/assets/img/macaroni-logged-out.png';
import { useRouter } from 'next/navigation';

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // NextAuth signIn calls authorize() which hits Laravel backend
            const res = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (res?.error) {
                setError("Email atau Password salah!");
            } else if (res?.ok) {
                router.push("/dashboard");
                router.refresh();
            }
        } catch (err) {
            setError("Terjadi kesalahan. Silakan coba lagi.");
        }

        setLoading(false);
    }

    const { theme } = useTheme();

    return (
        <div className="hk-pg-wrapper py-0" >
            <div className="hk-pg-body py-0">
                <Container fluid>
                    <Row className="auth-split">
                        <Col xl={5} lg={6} md={7} className="position-relative mx-auto">
                            <div className="auth-content flex-column pt-8 pb-md-8 pb-13">
                                <div className="text-center mb-7">
                                    <Link href="/" className="navbar-brand me-0">
                                        {theme === "light" ? <Image className="brand-img d-inline-block" src={jampackImg} alt="brand" /> : <Image className="brand-img d-inline-block" src={jampackImgDark} alt="brand" />}
                                    </Link>
                                </div>
                                <Form className="w-100" onSubmit={handleSubmit} >
                                    <Row>
                                        <Col xl={7} sm={10} className="mx-auto">
                                            <div className="text-center mb-4">
                                                <h4>Sign in to SantriGresik CRM</h4>
                                                <p>Sistem Manajemen Hubungan Pelanggan & Task Internal SantriGresik.id</p>
                                            </div>

                                            {error && (
                                                <Alert variant="danger" className="py-2 text-center">
                                                    {error}
                                                </Alert>
                                            )}

                                            <Row className="gx-3">
                                                <Col as={Form.Group} lg={12} className="mb-3" >
                                                    <div className="form-label-group">
                                                        <Form.Label>Email Address</Form.Label>
                                                    </div>
                                                    <Form.Control required placeholder="admin@santrigresik.id" type="email" value={email} onChange={e => setEmail(e.target.value)} />
                                                </Col>
                                                <Col as={Form.Group} lg={12} className="mb-3" >
                                                    <div className="form-label-group">
                                                        <Form.Label>Password</Form.Label>
                                                        <Link href="#" className="fs-7 fw-medium">Forgot Password ?</Link>
                                                    </div>
                                                    <InputGroup className="password-check">
                                                        <span className="input-affix-wrapper affix-wth-text">
                                                            <Form.Control required placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} type={showPassword ? "text" : "password"} />
                                                            <Link href="#" className="input-suffix text-primary text-uppercase fs-8 fw-medium" onClick={(e) => { e.preventDefault(); setShowPassword(!showPassword); }} >
                                                                {showPassword ? <span>Hide</span> : <span>Show</span>}
                                                            </Link>
                                                        </span>
                                                    </InputGroup>
                                                </Col>
                                            </Row>
                                            
                                            <Button variant="primary" type="submit" disabled={loading} className="btn-uppercase btn-block mt-4">
                                                {loading ? "Logging in..." : "Login"}
                                            </Button>
                                            
                                        </Col>
                                    </Row>
                                </Form>
                            </div>
                            {/* Page Footer */}
                            <div className="hk-footer border-0">
                                <Container fluid as="footer" className="footer">
                                    <Row>
                                        <div className="col-xl-8 text-center">
                                            <p className="footer-text pb-0"><span className="copy-text">SantriGresik © {new Date().getFullYear()} All rights reserved.</span></p>
                                        </div>
                                    </Row>
                                </Container>
                            </div>
                        </Col>
                        <Col xl={7} lg={6} md={5} sm={10} className="d-md-block d-none position-relative bg-primary-light-5">
                            <div className="auth-content flex-column text-center py-8">
                                <Row>
                                    <Col xxl={7} xl={8} lg={11} className="mx-auto">
                                        <h2 className="mb-4">Internal CRM System</h2>
                                        <p>Manage leads, contacts, tasks, and communications securely and efficiently.</p>
                                    </Col>
                                </Row>
                                <Image src={logoutImg} className="img-fluid w-sm-50 mt-7" alt="login" />
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>
        </div>
    )
}

export default Login
