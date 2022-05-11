console.time('getMax')
// let arr = ['8','92','45','7','2','0','34','467','1','59','52','93','96']
let arr = ['43','4','6']
const getMax = (arr) =>{
  let done  // 已经完成的标志位
  let len = arr.length
  for(let i=0;i<len-1;i++){
    for(let j=0;j<len-1-i;j++){
      let c = arr[j]
      let n = arr[j+1]
      if(arr[i].length > 1){
        c = arr[i][0]
      }
      if(arr[j+1].length > 1){
        n = arr[j+1][0]
      }
      if(c < n){
        // 正常
        [arr[j],arr[j+1]] = [arr[j+1],arr[j]]
        done = false
      }else if(arr[j].length > 1 && arr[j+1].length > 1){
        // 同为多位数
        let minLen = Math.min(arr[j].length,arr[j+1].length)
        for(let k=1;k<minLen;k++){
          if(arr[j][k] > arr[j+1][k]){
            [arr[j],arr[j+1]] = [arr[j+1],arr[j]]
            done = false
            break
          }
        }
      }else if(c === n && (arr[j].length > 1 || arr[j+1].length > 1)){
        // 首位相同 继续比较后面
        let maxLen = Math.max(arr[j].length,arr[j+1].length)
        for(let m=1;m<maxLen;m++){
          let lastI = arr[j][m] || arr[j][arr[j].length - 1]
          let lastJ = arr[j+1][m] || arr[j+1][arr[j+1].length - 1]
          if(lastI < lastJ){
            [arr[j],arr[j+1]] = [arr[j+1],arr[j]]
            done = false
            break
          }
        }
      }
    }
  }
  console.log(arr)
  return arr.join('')
}
console.log(getMax(arr))
console.timeEnd('getMax')

console.time('getMax2')
let arr2 = ['6','43','4']
function bubbleSort(arr=arr2) {
  let done  // 已经完成的标志位
  let len = arr.length
  for (let i = 0; i < len - 1; i++) {
    done = true
    for (let j = 0; j < len - 1 - i; j++) {
      if(arr[j] > Number.MAX_VALUE || arr[j] < -Number.MAX_VALUE) return "数值溢出！"
      if (arr[j] < arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]
        done = false
      }
    }
    if(done){
      return arr
    }
  }
  console.log(arr.join(''))
  return arr;
}
console.log(bubbleSort(arr2))
console.timeEnd('getMax2')