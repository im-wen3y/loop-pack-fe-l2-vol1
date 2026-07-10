import { TextOptionSelect } from '@/components/ui/select/TextOptionSelect'
import { SizeOptionSelect } from '@/components/ui/select/SizeOptionSelect'
import { ThumbnailOptionSelect } from '@/components/ui/select/ThumbnailOptionSelect'
import { getProducts, getSizes, getPurchaseOptions, toThumbnailOptions } from '@/services/catalog'
import { PreviewCard } from './PreviewCard'

export const SelectPreview = async () => {
  const [products, sizeOptions, textOptions] = await Promise.all([
    getProducts(),
    getSizes(),
    getPurchaseOptions(),
  ])
  const thumbnailOptions = toThumbnailOptions(products)

  return (
    <>
      <PreviewCard title="TextOptionSelect" description="이름·총액·1개당 단가·배지 조합, 품절 스킵">
        <TextOptionSelect title="옵션 선택" options={textOptions} />
      </PreviewCard>
      <PreviewCard title="SizeOptionSelect" description="재고(stock) 기반 품절 판정, 배송 문구">
        <SizeOptionSelect title="사이즈" options={sizeOptions} />
      </PreviewCard>
      <PreviewCard title="ThumbnailOptionSelect" description="썸네일 + 할인율/배지/묶음배지 조합">
        <ThumbnailOptionSelect title="옵션을 선택해 주세요" options={thumbnailOptions} />
      </PreviewCard>
    </>
  )
}
