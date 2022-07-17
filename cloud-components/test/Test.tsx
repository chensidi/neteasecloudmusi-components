import { defineComponent, ref, computed, Ref } from 'vue'
import classnames from 'classnames'

const Son = (props) => {
  return <p class={classnames('foo', { bar: true })}>this is use classNames</p>
}

const Iinput = defineComponent({
  props: {
    modelValue: {
      default: '123',
      type: String,
    },
  },
  setup(props, { emit }) {
    // const value = ref('')
    const ownValue = computed({
      get() {
        return props.modelValue
      },
      set(val: string) {
        emit('update:modelValue', val)
      },
    })
    return () => {
      return (
        <>
          <input type="text" v-model={ownValue.value} />
          <p>the input is {ownValue.value}</p>
        </>
      )
    }
  },
})

interface ChildProps {
  msg: string
  num: number
  onUpdateCount: (val: string) => void
}

const Child = defineComponent({
  emits: ['updateCount'],
  inheritAttrs: true,
  props: {
    msg: String,
    num: Number,
  },
  setup({ msg, num }, { emit, slots, attrs }) {
    console.log(attrs)
    const count: Ref<number> = ref<number>(num)
    function clichHandler() {
      count.value++
      emit('updateCount', count.value)
    }

    return () => {
      return (
        <div>
          {msg}
          <button onClick={clichHandler}>
            {slots?.default()}
            {slots?.title()}
            {count.value}
          </button>
        </div>
      )
    }
  },
})

const Test = defineComponent({
  directives: {
    go: (el, binding) => {
      console.log(el, binding)
    },
  },
  setup() {
    const text = ref('hello jsx')
    function listenChild(val: string) {
      console.log(val)
    }

    const list = ref([1])

    return () => {
      return (
        <>
          <Son v-go:hh={12345}></Son>
          hello world
          <Iinput v-model={text.value} />
          <Child
            onUpdateCount={listenChild}
            msg="child"
            num={100}
            v-slots={{
              default: () => 'count',
              title: () => 'title',
            }}
            other={'otherattrs'}
          />
          <button
            onClick={() => {
              list.value.push(list.value.at(-1) + 1)
            }}
          >
            add
          </button>
          {list.value.map((item) => {
            return <p>{item}</p>
          })}
        </>
      )
    }
  },
})

export default Test
