module.exports = function (content) {
  content = content.toString('utf-8').replace('module.exports = ', '')
  if (content.endsWith(';')) content = content.slice(0, -1)
  const { src, preSrc, palette } = JSON.parse(content)
  // console.log({ url: src, lqip: preSrc, palette })
  return (
    'module.exports = ' + JSON.stringify({ url: src, lqip: preSrc, palette })
  )
}
