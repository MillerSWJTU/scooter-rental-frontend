import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Spinner,
} from "react-bootstrap";
import {
  FaArrowLeft,
  FaClock,
  FaCalendarDay,
  FaCalendarWeek,
} from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";
import scooterService from "../../services/scooter.service";
import rentalService from "../../services/rental.service";
import "../../styles/components/RentalForm.css";

const RentalForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [scooter, setScooter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [rentalData, setRentalData] = useState({
    duration: 1,
    plan: "HOURLY",
    notes: "",
  });

  const rentalPlans = [
    {
      id: "HOURLY",
      title: "Hourly",
      icon: <FaClock />,
      price: scooter?.pricePerHour,
      unit: "hour",
      maxDuration: 24,
      description: "Flexible timing, suitable for short trips",
    },
    {
      id: "FOUR_HOURS",
      title: "4-Hour Package",
      icon: <FaClock />,
      price: scooter?.pricePerFourHours,
      unit: "4 hours",
      maxDuration: 6,
      description: "Ideal for half-day trips",
    },
    {
      id: "DAILY",
      title: "Daily",
      icon: <FaCalendarDay />,
      price: scooter?.pricePerDay,
      unit: "day",
      maxDuration: 7,
      description: "Use all day, no time worries",
    },
    {
      id: "WEEKLY",
      title: "Weekly",
      icon: <FaCalendarWeek />,
      price: scooter?.pricePerWeek,
      unit: "week",
      maxDuration: 4,
      description: "Economical choice for long-term use",
    },
  ];

  useEffect(() => {
    const loadScooterDetails = async () => {
      try {
        const data = await scooterService.getScooterById(id);
        setScooter(data);
        setError("");
      } catch (err) {
        console.error("Error loading scooter details:", err);
        setError("Failed to load the details of the scooter!");
      } finally {
        setLoading(false);
      }
    };

    loadScooterDetails();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRentalData((prev) => ({
      ...prev,
      [name]:
        name === "duration"
          ? value === ""
            ? ""
            : parseInt(value) || 1
          : value,
    }));
  };

  const handlePlanSelect = (planId) => {
    setRentalData((prev) => ({
      ...prev,
      plan: planId,
      duration: 1,
    }));
  };

  const getMaxDuration = () => {
    const plan = rentalPlans.find((p) => p.id === rentalData.plan);
    return plan ? plan.maxDuration : 24;
  };

  const calculateTotalPrice = () => {
    const plan = rentalPlans.find((p) => p.id === rentalData.plan);
    if (!plan || !scooter) return 0;
    let price = 0;
    switch (plan.id) {
      case "HOURLY":
        price = scooter.pricePerHour * rentalData.duration;
        break;
      case "FOUR_HOURS":
        price = scooter.pricePerFourHours * rentalData.duration;
        break;
      case "DAILY":
        price = scooter.pricePerDay * rentalData.duration;
        break;
      case "WEEKLY":
        price = scooter.pricePerWeek * rentalData.duration;
        break;
      default:
        price = 0;
    }
    // 8折优惠
    if (currentUser && currentUser.role === "ROLE_DISCOUNT") {
      price = price * 0.8;
    }
    return price;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      if (rentalData.duration < 1) {
        throw new Error("Rental period must be greater than 0!");
      }

      const payload = {
        username: currentUser.username,
        scooterId: id,
        duration: rentalData.duration,
        plan: rentalData.plan,
        notes: rentalData.notes,
        startLocation: scooter.location,
      };

      const newRental = await rentalService.createRental(payload);
      if (newRental) {
        navigate("/rentals/manage");
      } else {
        throw new Error("创建租赁记录失败，请重试");
      }
    } catch (err) {
      console.error("Error creating rental:", err);
      setError(err.message || "创建租赁记录失败，请重试");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate(`/scooters/${id}`);
  };

  if (loading) {
    return (
      <Container className="py-4 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-4">
        <Alert variant="danger">{error}</Alert>
        <Button variant="secondary" onClick={handleBack}>
          Back to details
        </Button>
      </Container>
    );
  }

  if (!scooter) {
    return (
      <Container className="py-4">
        <Alert variant="warning">
          Failed to load the details of the scooter!
        </Alert>
        <Button variant="secondary" onClick={handleBack}>
          Back to details
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Button variant="link" className="back-button" onClick={handleBack}>
        <FaArrowLeft /> Back to details
      </Button>

      <Row>
        <Col md={8} lg={6} className="mx-auto">
          <Card className="shadow-sm">
            <Card.Body>
              <h4 className="mb-4">Rental {scooter.model}</h4>
              {currentUser && currentUser.role === "ROLE_DISCOUNT" && (
                <Alert variant="success">
                  You have been certified as a student/elderly and enjoy a 20%
                  discount.
                </Alert>
              )}

              {error && (
                <Alert variant="danger" className="mb-4">
                  {error}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold mb-3">
                    Choose the rental plan
                  </Form.Label>
                  <div className="rental-plans">
                    {rentalPlans.map((plan) => (
                      <div
                        key={plan.id}
                        className={`rental-plan-card ${
                          rentalData.plan === plan.id ? "selected" : ""
                        }`}
                        onClick={() => handlePlanSelect(plan.id)}
                      >
                        <div className="plan-icon">{plan.icon}</div>
                        <div className="plan-info">
                          <h5>{plan.title}</h5>
                          <p className="price">
                            ¥{plan.price}/{plan.unit}
                          </p>
                          <p className="description">{plan.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold">
                    Rental Duration (max {getMaxDuration()}{" "}
                    {rentalPlans.find((p) => p.id === rentalData.plan)?.unit ||
                      "hours"}
                    )
                  </Form.Label>
                  <Form.Control
                    type="number"
                    name="duration"
                    min="1"
                    max={getMaxDuration()}
                    value={
                      rentalData.duration === "" ? "" : rentalData.duration
                    }
                    onChange={handleChange}
                    className="duration-input"
                  />
                </Form.Group>

                <div className="total-price mb-4">
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="fw-bold">Estimated Cost</span>
                    <span className="price">
                      ¥{calculateTotalPrice().toFixed(2)}
                    </span>
                  </div>
                  {currentUser && currentUser.role === "ROLE_DISCOUNT" && (
                    <span className="ms-2 text-success">(20% off)</span>
                  )}
                </div>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold">Notes (optional)</Form.Label>
                  <Form.Control
                    as="textarea"
                    name="notes"
                    rows={3}
                    value={rentalData.notes}
                    onChange={handleChange}
                    placeholder="please explain here, if you have any special requirements!"
                    className="notes-input"
                  />
                </Form.Group>

                <div className="d-grid">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={submitting}
                    className="submit-button"
                  >
                    {submitting ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          className="me-2"
                        />
                        Processing...
                      </>
                    ) : (
                      "Confirm the rental"
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default RentalForm;
