import React, { useState } from 'react';
import { Button, Modal, Form, InputGroup, Alert, Spinner } from 'react-bootstrap';
import { FaPlus, FaMinus, FaClock, FaStop, FaBan, FaSync } from 'react-icons/fa';
import rentalService from '../../services/rental.service';

const RentalActions = ({ rental, onUpdate }) => {
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [extensionHours, setExtensionHours] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  const resetState = () => {
    setError('');
    setProcessing(false);
    setRetryCount(0);
  };

  const handleRetry = async (action) => {
    setRetryCount(prev => prev + 1);
    if (retryCount >= 3) {
      setError('多次重试失败，请刷新页面后重试');
      return;
    }
    
    switch (action) {
      case 'extend':
        await handleExtend();
        break;
      case 'end':
        await handleEnd();
        break;
      case 'cancel':
        await handleCancel();
        break;
      default:
        break;
    }
  };

  const handleExtend = async () => {
    setProcessing(true);
    setError('');
    try {
      if (!rental?.id) {
        throw new Error('租赁信息无效');
      }
      const updatedRental = await rentalService.extendRental(rental.id, extensionHours);
      if (updatedRental) {
        setShowExtendModal(false);
        resetState();
        onUpdate(updatedRental);
      } else {
        throw new Error('未能获取更新后的租赁信息');
      }
    } catch (err) {
      setError(err.message);
      setProcessing(false);
    }
  };

  const handleEnd = async () => {
    setProcessing(true);
    setError('');
    try {
      if (!rental?.id) {
        throw new Error('租赁信息无效');
      }
      const updatedRental = await rentalService.endRental(rental.id);
      if (updatedRental) {
        setShowEndModal(false);
        resetState();
        onUpdate(updatedRental);
      } else {
        throw new Error('未能获取更新后的租赁信息');
      }
    } catch (err) {
      setError(err.message);
      setProcessing(false);
    }
  };

  const handleCancel = async () => {
    setProcessing(true);
    setError('');
    try {
      if (!rental?.id) {
        throw new Error('租赁信息无效');
      }
      const updatedRental = await rentalService.cancelRental(rental.id);
      if (updatedRental) {
        setShowCancelModal(false);
        resetState();
        onUpdate(updatedRental);
      } else {
        throw new Error('未能获取更新后的租赁信息');
      }
    } catch (err) {
      setError(err.message);
      setProcessing(false);
    }
  };

  const renderErrorWithRetry = (action) => (
    <Alert variant="danger" className="mb-3">
      <div className="d-flex justify-content-between align-items-center">
        <div>{error}</div>
        {retryCount < 3 && (
          <Button
            variant="outline-danger"
            size="sm"
            onClick={() => handleRetry(action)}
            disabled={processing}
          >
            <FaSync className="me-1" />
            重试
          </Button>
        )}
      </div>
    </Alert>
  );

  return (
    <>
      <div className="d-flex gap-2">
        <Button
          variant="primary"
          onClick={() => {
            resetState();
            setShowExtendModal(true);
          }}
          disabled={rental?.status !== 'ACTIVE' || processing}
        >
          <FaClock className="me-2" />
          延长租赁时间
        </Button>
        <Button
          variant="warning"
          onClick={() => {
            resetState();
            setShowEndModal(true);
          }}
          disabled={rental?.status !== 'ACTIVE' || processing}
        >
          <FaStop className="me-2" />
          结束租赁
        </Button>
        <Button
          variant="danger"
          onClick={() => {
            resetState();
            setShowCancelModal(true);
          }}
          disabled={rental?.status !== 'ACTIVE' || processing}
        >
          <FaBan className="me-2" />
          取消租赁
        </Button>
      </div>

      {/* 延长租赁时间弹窗 */}
      <Modal show={showExtendModal} onHide={() => !processing && setShowExtendModal(false)}>
        <Modal.Header closeButton={!processing}>
          <Modal.Title>延长租赁时间</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && renderErrorWithRetry('extend')}
          <Form>
            <Form.Group>
              <Form.Label>延长时间（小时）</Form.Label>
              <InputGroup>
                <Button
                  variant="outline-secondary"
                  onClick={() => setExtensionHours(Math.max(1, extensionHours - 1))}
                  disabled={processing}
                >
                  <FaMinus />
                </Button>
                <Form.Control
                  type="number"
                  min="1"
                  max="24"
                  value={extensionHours}
                  onChange={(e) => setExtensionHours(Math.max(1, parseInt(e.target.value) || 1))}
                  disabled={processing}
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => setExtensionHours(Math.min(24, extensionHours + 1))}
                  disabled={processing}
                >
                  <FaPlus />
                </Button>
              </InputGroup>
              <Form.Text className="text-muted">
                每次最多可延长24小时
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowExtendModal(false)} disabled={processing}>
            取消
          </Button>
          <Button variant="primary" onClick={handleExtend} disabled={processing}>
            {processing ? (
              <>
                <Spinner size="sm" animation="border" className="me-2" />
                处理中...
              </>
            ) : '确认延长'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* 结束租赁弹窗 */}
      <Modal show={showEndModal} onHide={() => !processing && setShowEndModal(false)}>
        <Modal.Header closeButton={!processing}>
          <Modal.Title>结束租赁</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && renderErrorWithRetry('end')}
          <p>确定要结束当前租赁吗？系统将根据实际使用时间计算费用。</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEndModal(false)} disabled={processing}>
            取消
          </Button>
          <Button variant="warning" onClick={handleEnd} disabled={processing}>
            {processing ? (
              <>
                <Spinner size="sm" animation="border" className="me-2" />
                处理中...
              </>
            ) : '确认结束'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* 取消租赁弹窗 */}
      <Modal show={showCancelModal} onHide={() => !processing && setShowCancelModal(false)}>
        <Modal.Header closeButton={!processing}>
          <Modal.Title>取消租赁</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && renderErrorWithRetry('cancel')}
          <p>
            租赁开始后5分钟内可以免费取消。超过5分钟后，请选择"结束租赁"。
            <br />
            确定要取消当前租赁吗？
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCancelModal(false)} disabled={processing}>
            取消
          </Button>
          <Button variant="danger" onClick={handleCancel} disabled={processing}>
            {processing ? (
              <>
                <Spinner size="sm" animation="border" className="me-2" />
                处理中...
              </>
            ) : '确认取消'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default RentalActions; 