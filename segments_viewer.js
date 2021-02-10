class SegmentsViewer {
    constructor(node, segmentTypesCount) {
        this.node = node;
        this.segmentTypesCount = segmentTypesCount;
        this.twilioLogo = this.createTwilioLogo();
        this.blockMap = new Map();
        this.selectedBlocks = [];
    }

    createTwilioLogo() {
        let img = document.createElement('img');
        const twilio_logo = '<svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" preserveAspectRatio="xMidYMid meet"><path d="M15 0C6.7 0 0 6.7 0 15s6.7 15 15 15 15-6.7 15-15S23.3 0 15 0zm0 26C8.9 26 4 21.1 4 15S8.9 4 15 4s11 4.9 11 11-4.9 11-11 11zm6.8-14.7c0 1.7-1.4 3.1-3.1 3.1s-3.1-1.4-3.1-3.1 1.4-3.1 3.1-3.1 3.1 1.4 3.1 3.1zm0 7.4c0 1.7-1.4 3.1-3.1 3.1s-3.1-1.4-3.1-3.1c0-1.7 1.4-3.1 3.1-3.1s3.1 1.4 3.1 3.1zm-7.4 0c0 1.7-1.4 3.1-3.1 3.1s-3.1-1.4-3.1-3.1c0-1.7 1.4-3.1 3.1-3.1s3.1 1.4 3.1 3.1zm0-7.4c0 1.7-1.4 3.1-3.1 3.1S8.2 13 8.2 11.3s1.4-3.1 3.1-3.1 3.1 1.4 3.1 3.1z"/></svg>';
        img.setAttribute("src", "data:image/svg+xml;base64," + btoa(twilio_logo));
        return img;
    }

    createTwilioReservedCodeUnitBlock(segmentType) {
        let block = document.createElement("div");
        block.setAttribute("class", `block twilio ${segmentType}`);
        let twilioLogo = this.twilioLogo.cloneNode();
        block.appendChild(twilioLogo);
        return block;
    }

    createCodeUnitBlock(codeUnit, segmentType, mapKey, isGSM7) {
        let block = document.createElement('div');
        block.setAttribute('class', `block ${segmentType} ${isGSM7 ? '' : 'non-gsm'}`);

        block.setAttribute("data-key", mapKey);
        this.blockMap.get(mapKey).push(block);

        let span = document.createElement('span');
        span.textContent = "0x" + codeUnit.toString(16).padStart(4, '0').toUpperCase();

        block.appendChild(span);
        return block;
    }

    update(segmentedMessage) {
        this.blockMap.clear();

        let newSegments = document.createElement("div");
        newSegments.setAttribute("id", "segments-viewer");

        for (let segmentIndex = 0; segmentIndex < segmentedMessage.segments.length; segmentIndex++) {
            const segmentType = `segment-type-${segmentIndex % this.segmentTypesCount}`;
            const segment = segmentedMessage.segments[segmentIndex];

            for (let charIndex = 0; charIndex < segment.length; charIndex++) {
                const encodedChar = segment[charIndex];
                const mapKey = `${segmentIndex}-${charIndex}`;
                this.blockMap.set(mapKey, []);

                if (encodedChar instanceof TwilioReservedChar) {
                    newSegments.appendChild(this.createTwilioReservedCodeUnitBlock(segmentType));
                } else {
                    if (encodedChar.codeUnits) {
                        for (const codeUnit of encodedChar.codeUnits) {
                            newSegments.appendChild(
                                this.createCodeUnitBlock(codeUnit, segmentType, mapKey, encodedChar.isGSM7)
                            );
                        }
                    }
                }
            }
        }

        this.node.replaceWith(newSegments);
        this.node = newSegments;
    }

    select(mapKey) {
        this.clearSelection();

        for (let block of this.blockMap.get(mapKey)) {
            block.classList.add("selected");
            this.selectedBlocks.push(block);
        }
    }

    clearSelection() {
        for (let block of this.selectedBlocks) {
            block.classList.remove("selected");
        }

        this.selectedBlocks.length = 0;
    }
}


class MessageViewer {
    constructor(node, segmentTypesCount) {
        this.node = node;
        this.segmentTypesCount = segmentTypesCount;
        this.blockMap = new Map();
        this.selectedBlock = null;
    }

    createCharBlock(encodedChar, segmentType, mapKey) {
        let block = document.createElement('div');
        block.setAttribute('class', `block ${segmentType}`);
        if (!encodedChar.codeUnits) {
            block.classList.add('error');
        }

        block.setAttribute("data-key", mapKey);
        this.blockMap.set(mapKey, block);

        let span = document.createElement('span');
        span.textContent = encodedChar.raw.replace(' ', '\u00A0');
        block.appendChild(span);
        return block;
    }

    update(segmentedMessage) {
        this.blockMap.clear();
        let newMessage = document.createElement("div");
        newMessage.setAttribute("id", "message-viewer");

        for (let segmentIndex = 0; segmentIndex < segmentedMessage.segments.length; segmentIndex++) {
            const segmentType = `segment-type-${segmentIndex % this.segmentTypesCount}`;
            const segment = segmentedMessage.segments[segmentIndex];

            for (let charIndex = 0; charIndex < segment.length; charIndex++) {
                const encodedChar = segment[charIndex];
                const mapKey = `${segmentIndex}-${charIndex}`;

                if (!(encodedChar instanceof TwilioReservedChar)) {
                    newMessage.appendChild(this.createCharBlock(encodedChar, segmentType, mapKey));
                }
            }
        }

        this.node.replaceWith(newMessage);
        this.node = newMessage;

        this.markInvisibleCharacters();
    }

    markInvisibleCharacters() {
        for (let span of this.node.querySelectorAll("span")) {
            if (span.offsetWidth === 0) {
                span.classList.add("invisible");
            }
        }
    }

    select(mapKey) {
        this.clearSelection();

        this.selectedBlock = this.blockMap.get(mapKey);
        this.selectedBlock.classList.add("selected");
    }

    clearSelection() {
        if (this.selectedBlock) {
            this.selectedBlock.classList.remove("selected");
        }
        this.selectedBlock = null;        
    }
}