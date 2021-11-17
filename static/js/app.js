class Node {
    static incrementId() {
        if (!this.latestId) this.latestId = 1
        else this.latestId++
        return this.latestId-1
    }
    static colors = [[150,100,0,1],[0,150,0,1]]
    static textures = ['house', 'house_g']
    constructor(coordinates) {
        [this.x, this.y] = coordinates
        this.id = Node.incrementId()
        this.radius = 17
        this.active = false
        this.color = Node.colors[0]
        this.texture = Node.textures[0]
        this.hubMember = false
    }
    toggle() {
        this.active = !this.active
        this.color = Node.colors[+this.active]
        this.texture = Node.textures[+this.active]
    }
    makeHubMember() {
        this.active = true
        this.hubMember = true
        this.color = Node.colors[+this.active]
        this.texture = Node.textures[+this.active]
    }
    removeHubMember() {
        this.active = false
        this.hubMember = false
        this.color = Node.colors[+this.active]
        this.texture = Node.textures[+this.active]
    }
    get geometry() {
        return [this.x, this.y, this.radius]
    }

}
class Hub extends Node {
    constructor(coordinates, nodes) {
        super(coordinates)
        this.radius = 80
        this.nodeIds = []
        this.texture = 'storage'
        this.active = true
        this.color = [50,100,50,0.5]
        nodes.forEach(node => {
            if (this.canContain(node)) this.addNode(node.id)
        })
    }
    canContain(node) {
        let h = this.asEllipse
        if (((node.x-h.x)**2 / h.rx**2) + ((node.y-h.y)**2/h.ry**2) <= 1) {
            return true
        } 
        return false
    }
    addNode(nodeID) {
        this.nodeIds.push(nodeID)
    }
    get containedNodes() {
        return this.nodeIds
    }
    get asEllipse() {
        return { 
            'x': this.x,
            'y': this.y,
            'rx': this.radius,
            'ry': this.radius * 0.56,
        }
    }
    get geometry() {
        const e = this.asEllipse
        return [e.x, e.y, e.rx, e.ry]
    }
}

const Game = (() => {
    const size = 500
    const canvas = document.querySelector('#main')
    let nodes = []
    let hubs = []
    let nodeList = []
    let nodeConncetions = []
    let pathLength = 0
    let pathLengthInfo = document.getElementById('pathLength')
    randomPosition = (nodePositions) => {
        margin = 35
        let ok = false
        let x, y
        while (!ok) {
            ok = true
            x = Math.round(margin + (Math.random() * (size - margin*2)))
            y = Math.round(margin + (Math.random() * (size - margin*2)))
            nodePositions.forEach(p => {
                let [x2, y2, _] = p
                let a = x - x2
                let b = y - y2
                let c = Math.sqrt( a*a + b*b )
                if (c < 20) {
                    ok = false
                }
            })
        }
        return [x,y]
    }
    changeNodeOrder = (node) => {
        nodeList = nodeList.filter((v, i , a) => v != node && !v.hubMember)
        if (node.active && !node.hubMember) {
            nodeList.push(node)
        }
    }
    pointsDistance = (x1,y1,x2,y2) => {
        return Math.sqrt((x2-x1)**2+(y2-y1)**2)
    }
    connectNodes = () => {
        nodeConncetions = []
        pathLength = 0
        for (let i=0;i<nodeList.length-1;i++) {
            if (!nodeList[i].hubMember) {
                nodeConncetions.push({'x1': nodeList[i].x, 'y1': nodeList[i].y, 'x2': nodeList[i+1].x, 'y2': nodeList[i+1].y})
                pathLength += pointsDistance( nodeList[i].x, nodeList[i].y, nodeList[i+1].x, nodeList[i+1].y)
            }
        }
        if (nodes.filter(n => !n.active).length == 0) {
            nodeConncetions.push({'x1': nodeList[nodeList.length-1].x, 'y1': nodeList[nodeList.length-1].y, 'x2': nodeList[0].x, 'y2': nodeList[0].y})
            pathLength += pointsDistance( nodeList[nodeList.length-1].x, nodeList[nodeList.length-1].y, nodeList[0].x, nodeList[0].y)
        }
        pathLengthInfo.innerText = Math.round(pathLength)
    }
    nodesInHubs = ( )=> {
        return hubs.map(h => h.containedNodes).flat()
    }
    initEventListeners = () => {
        document.querySelectorAll("button").forEach(el => {
            el.onclick = (e) => {
                document.querySelectorAll("button").forEach(el => el.classList.remove('selected'))
                e.target.classList.add('selected')
                Game.reload(e.target.dataset.nodes);
            }
        })
        canvas.onclick = (e) => {
            let cX = e.clientX - canvas.getBoundingClientRect().left
            let cY = e.clientY - canvas.getBoundingClientRect().top
            let addHub = true
            nodes.forEach(node => {
                if (Math.sqrt((cX-node.x) ** 2 + (cY-node.y) ** 2) < node.radius && !node.hubMember) {
                    addHub = false
                    node.toggle()
                    changeNodeOrder(node)
                }
            })
            hubs.forEach(hub => {
                if (Math.sqrt((cX-hub.x) ** 2 + (cY-hub.y) ** 2) <= hub.radius+3) {
                    hubs = hubs.filter((v, i , a) => v != hub)
                    addHub = false
                    hub.active = false;
                    hub.containedNodes.forEach(nodeId => {
                        nodes.find( ({ id }) => id === nodeId ).removeHubMember()
                    })
                    changeNodeOrder(hub) 
                }
            })
            if (addHub) {
                let hub = new Hub([cX, cY], nodes.filter((n) => !n.hubMember))
                hubs.push(hub)
                changeNodeOrder(hub)
            }
            nodesInHubs().forEach(nodeId => {
                nodes.find( ({ id }) => id === nodeId ).makeHubMember()
                changeNodeOrder(nodes.find( ({ id }) => id === nodeId ))
            })
            connectNodes()
            CanvasRenderer.clear()
            if (nodeList.length > 1) CanvasRenderer.drawLines(nodeConncetions)
            drawHubs()
            drawNodes()
        }
    }
    drawHubs = () => {
        hubs.forEach(hub => {
            CanvasRenderer.drawHub(hub.geometry, hub.color, true)
            //CanvasRenderer.drawBuilding(hub.geometry, hub.texture)
        })
    }
    drawNodes = () => {
        nodes.forEach(node => {
            //CanvasRenderer.drawNode(node.geometry, node.color, node.hubMember)
            CanvasRenderer.drawBuilding(node.geometry, node.texture)
        })
    }
    return {
        start: (nNodes) => {
            pathLengthInfo.innerText = Math.round(pathLength)
            CanvasRenderer.init(canvas, () => {
                for (let i=0;i<nNodes;i++) {
                    nodes.push(new Node(randomPosition(nodes.map(n => n.geometry))))
                    hubs.map(h => h.containedNodes)
                }
                nodes.sort((a, b) => parseFloat(a.x) - parseFloat(b.x))
                nodes.sort((a, b) => parseFloat(a.y) - parseFloat(b.y))
                initEventListeners()
                drawNodes()
            });
        },
        reload: (nNodes) => {
            nodes = []
            hubs = []
            nodeList = []
            nodeConncetions = []
            pathLengthInfo.innerText = 0
            for (let i=0;i<nNodes;i++) {
                nodes.push(new Node(randomPosition(nodes.map(n => n.geometry))))
                hubs.map(h => h.containedNodes)
            }
            nodes.sort((a, b) => parseFloat(a.x) - parseFloat(b.x))
            nodes.sort((a, b) => parseFloat(a.y) - parseFloat(b.y))
            CanvasRenderer.clear()
            drawNodes()
        }
    }    
})();
Game.start(10);