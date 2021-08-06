
class Stack {
    constructor() {
        this.top = -1
        this.items = {}
    }

    push(item) {
        this.top++
        this.items[this.top] = item
    }

    pop() {
        let top = this.items[this.top]
        delete this.items[this.top] 
        this.top--
        return top;
        
    }

    get peek() {
        return this.items[this.top]
    }
}


describe('test', () => {
    let stack


    beforeEach(() => {
        stack = new Stack()
    })


    it('it is empty', () => {
        expect(stack.top).toBe(-1)
        expect(stack.items).toEqual({})
    })


    it('it can push', () => {
        stack.push('🥑')
        expect(stack.top).toBe(0)
        expect(stack.items).toEqual({ 0: '🥑' })
    })
    it('it can pop', () => {
        stack.push('🥑')
        var top = stack.pop()
        expect(stack.top).toBe(-1)
        expect(stack.items).toEqual({})
        expect(top).toBe('🥑')
    })
})

