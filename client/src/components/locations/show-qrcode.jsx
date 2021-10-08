import React, {useState} from "react";
import {Button, Modal} from "semantic-ui-react";
import QRCode from "react-qr-code";
import html2canvas from "html2canvas";

function ShowQRCode(props) {
    const {url} = props
    const [open, setOpen] = useState(false);
    return (
        <Modal onClose={() => setOpen(false)}
            onOpen={() => setOpen(true)}
            open={open}
            trigger={
                <i className='qrcode icon' style={{ marginRight: 20 }} />
            }>
            <Modal.Header>QR Code</Modal.Header>
            <Modal.Content>
                <div style={{ display: 'flex', justifyContent: "center", padding: 15 }}>
                    <div id='QRCode' style={{ padding: 5 }}>
                        <QRCode value={url} className="HpQrcode" />
                    </div>
                </div>
                <div style={{ display: 'flex', justifyContent: "center", padding: 15 }}>
                    <h4><a href={url} target="_blank">{url}</a></h4>
                </div>
            </Modal.Content>
            <Modal.Actions>
                <Button onClick={() => setOpen(false)}>Close</Button>
                <Button onClick={() => {
                    downloadQR()
                    setOpen(false)
                }} color={"green"}>Download QR Code</Button>
            </Modal.Actions>
        </Modal>
    )
}

const downloadQR = () => {
    const element = document.getElementById('QRCode');
    html2canvas(element, { useCORS: true }).then(function (canvas) {
        const pngUrl = canvas
            .toDataURL("image/png")
            .replace("image/png", "image/octet-stream");
        let downloadLink = document.createElement("a");
        downloadLink.href = pngUrl;
        downloadLink.download = "QRCode.png";
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    });
}
export default ShowQRCode
