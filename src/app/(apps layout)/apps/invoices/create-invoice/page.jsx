'use client'
import { useState } from 'react';
import classNames from 'classnames';
import InvoiceAppSidebar from '../InvoiceAppSidebar';
import Body from './Body';
import Header from './Header';
import SettingPannel from './SettingPannel';
import { useRouter } from 'next/navigation';

const CreateInvoice = () => {
    const [showSidebar, setShowSidebar] = useState(true);
    const [openSettingPannel, setOpenSettingPannel] = useState(false);
    const [invoiceData, setInvoiceData] = useState({
        items: [],
        amount: 0,
        status: "DRAFT"
    });
    
    const router = useRouter();

    const handleSaveInvoice = async () => {
        try {
            const res = await fetch('/api/invoices', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(invoiceData)
            });
            if (res.ok) {
                alert("Invoice Saved Successfully!");
                router.push('/apps/invoices/invoice-list');
            } else {
                alert("Failed to save Invoice.");
            }
        } catch (e) {
            console.error(e);
            alert("Error saving invoice.");
        }
    };

    return (
        <div className="hk-pg-body py-0">
            <div className={classNames("invoiceapp-wrap", { "invoiceapp-sidebar-toggle": !showSidebar }, { "invoiceapp-setting-active": openSettingPannel })}>
                <InvoiceAppSidebar />
                <div className="invoiceapp-content">
                    <div className="invoiceapp-detail-wrap">
                        <Header toggleSidebar={() => setShowSidebar(!showSidebar)} show={showSidebar} handleSettings={() => setOpenSettingPannel(!openSettingPannel)} handleSave={handleSaveInvoice} />
                        <Body onInvoiceUpdate={(data) => setInvoiceData(prev => ({ ...prev, ...data }))} />
                        <SettingPannel onHide={() => setOpenSettingPannel(false)} />
                    </div>
                </div>
            </div>
        </div>

    )
}

export default CreateInvoice;