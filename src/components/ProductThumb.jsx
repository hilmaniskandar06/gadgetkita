export default function ProductThumb({ product, image, size, className = '' }) {
  let imgUrl = image || product?.displayImage || product?.images?.[0] || product?.image
  if (typeof imgUrl === 'object') {
    imgUrl = imgUrl.url
  }
  if (typeof imgUrl === 'string') {
    if (imgUrl === '[object Object]') imgUrl = ''
    else imgUrl = imgUrl.split('#color=')[0]
  }

  const style = size ? { width: size, height: size } : undefined

  if (imgUrl) {
    return (
      <img
        src={imgUrl}
        alt={product?.name || ''}
        style={style}
        className={`object-cover ${size ? 'rounded' : 'w-full h-full'} ${className}`}
        onError={(e) => {
          e.target.onerror = null
          e.target.style.display = 'none'
        }}
      />
    )
  }
  return (
    <div
      style={style}
      className={`bg-gray-100 border border-gray-200 rounded flex items-center justify-center text-[10px] text-slate-500 font-semibold ${size ? '' : 'w-full h-full'} ${className}`}
    >
      No Image
    </div>
  )
}
