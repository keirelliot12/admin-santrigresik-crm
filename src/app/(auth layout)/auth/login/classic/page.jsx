'use client'
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button, Card, Col, Container, Form, InputGroup, Row, Alert } from 'react-bootstrap';
import { Eye, EyeOff } from 'react-feather';
import { signIn } from 'next-auth/react';
import CommonFooter1 from '../../CommonFooter1';

//Image
import jampackImg from '@/assets/img/logo-light.svg';
import jampackImgDark from '@/assets/img/logo-dark.svg';
import { useTheme } from '@/layout/theme-provider/theme-provider';

const LoginClassic = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const router = useRouter()
    
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
        <div className="hk-pg-wrapper pt-0 pb-xl-0 pb-5">
            <div className="hk-pg-body pt-0 pb-xl-0">
                <Container>
                    <Row>
                        <Col sm={10} className="position-relative mx-auto">
                            <div className="auth-content py-8">
                                <Form className="w-100" onSubmit={handleSubmit}>
                                    <Row>
                                        <Col lg={5} md={7} sm={10} className="mx-auto">
                                            <div className="text-center mb-7">
                                                <Link href="/" className="navbar-brand me-0">
                                                    {theme === "light" ? <Image className="brand-img d-inline-block" src={jampackImg} alt="brand" /> : <Image className="brand-img d-inline-block" src={jampackImgDark} alt="brand" />}
                                                </Link>
                                            </div>
                                            <Card className="card-lg card-border">
                                                <Card.Body>
                                                    <h4 className="mb-4 text-center">Sign in to SantriGresik CRM</h4>
                                                    
                                                    {error && (
                                                        <Alert variant="danger" className="py-2 text-center">
                                                            {error}
                                                        </Alert>
                                                    )}

                                                    <Row className="gx-3">
                                                        <Col as={Form.Group} lg={12} className="mb-3">
                                                            <div className="form-label-group">
                                                                <Form.Label>Email Address</Form.Label>
                                                            </div>
                                                            <Form.Control required placeholder="admin@santrigresik.id" type="email" value={email} onChange={e => setEmail(e.target.value)} />
                                                        </Col>
                                                        <Col as={Form.Group} lg={12} className="mb-3">
                                                            <div className="form-label-group">
                                                                <Form.Label>Password</Form.Label>
                                                            </div>
                                                            <InputGroup className="password-check">
                                                                <span className="input-affix-wrapper">
                                                                    <Form.Control required placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} type={showPassword ? "text" : "password"} />
                                                                    <a href="#" className="input-suffix text-muted" onClick={(e) => { e.preventDefault(); setShowPassword(!showPassword); }} >
                                                                        <span className="feather-icon">
                                                                            {showPassword ? <EyeOff className="form-icon" /> : <Eye className="form-icon" />}
                                                                        </span>
                                                                    </a>
                                                                </span>
                                                            </InputGroup>
                                                        </Col>
                                                    </Row>
                                                    <Button variant="primary" type="submit" disabled={loading} className="btn-uppercase btn-block mt-4">
                                                        {loading ? "Logging in..." : "Login"}
                                                    </Button>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    </Row>
                                </Form>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>
            {/* Page Footer */}
            <CommonFooter1 />
        </div>
    )
}

export default LoginClassic;
