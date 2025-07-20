import { NextResponse } from "next/server"

/**
 * Manejador de solicitudes GET para obtener precios de Binance P2P
 * Filtra anunciantes con más de 500 órdenes
 */
export async function GET(request: Request) {
  try {
    // Obtener parámetros de la URL
    const { searchParams } = new URL(request.url)
    const tradeType = searchParams.get("tradeType") || "SELL" // SELL o BUY
    const minOrders = 500 // Mínimo de órdenes requeridas

    // Configuración para obtener múltiples páginas de anuncios
    const url = "https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search"
    const maxPages = 3 // Obtener hasta 3 páginas de resultados
    let allAds = []

    console.log(`Obteniendo anuncios de tipo ${tradeType} (hasta ${maxPages} páginas)...`)

    // Obtener múltiples páginas de anuncios
    for (let page = 1; page <= maxPages; page++) {
      // Payload exacto como lo envía el navegador
      const payload = {
        asset: "USDT",
        countries: [],
        fiat: "BOB",
        page: page,
        payTypes: [],
        proMerchantAds: false,
        publisherType: null,
        rows: 20,
        tradeType: tradeType,
        transAmount: "",
      }

      // Headers completos como los envía un navegador real
      const headers = {
        Accept: "*/*",
        "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
        "Bnc-Uuid": `0c7c508e-${Math.random().toString(36).substring(2, 10)}`,
        "Cache-Control": "no-cache",
        "Content-Type": "application/json",
        Lang: "es",
        Origin: "https://p2p.binance.com",
        Pragma: "no-cache",
        Referer: "https://p2p.binance.com/es/trade/all-payments/USDT?fiat=BOB",
        "Sec-Ch-Ua": '"Google Chrome";v="113", "Chromium";v="113", "Not-A.Brand";v="24"',
        "Sec-Ch-Ua-Mobile": "?0",
        "Sec-Ch-Ua-Platform": '"Windows"',
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36",
        "X-Trace-Id": `${Math.random().toString(36).substring(2, 15)}`,
        "Client-Type": "web",
      }

      console.log(`Solicitando página ${page}...`)

      try {
        // Realizar la solicitud a la API de Binance P2P con todos los headers necesarios
        const response = await fetch(url, {
          method: "POST",
          headers: headers,
          body: JSON.stringify(payload),
          cache: "no-store", // Evitar caché
        })

        // Verificar si la respuesta es exitosa
        if (!response.ok) {
          console.error(`Error en la respuesta de Binance P2P (página ${page}):`, response.status, response.statusText)
          continue // Continuar con la siguiente página
        }

        // Obtener el texto de la respuesta para depuración
        const responseText = await response.text()
        console.log(`Respuesta de página ${page} (primeros 100 caracteres):`, responseText.substring(0, 100))

        // Intentar parsear la respuesta como JSON
        let data
        try {
          data = JSON.parse(responseText)
        } catch (error) {
          console.error(`Error al parsear la respuesta JSON (página ${page}):`, error)
          continue // Continuar con la siguiente página
        }

        // Verificar la estructura de la respuesta
        if (!data || !data.data) {
          console.error(`Estructura de respuesta inesperada (página ${page}):`, data)
          continue // Continuar con la siguiente página
        }

        // Verificar si hay datos en la respuesta
        if (data.data.length === 0) {
          console.log(`No hay más anuncios en la página ${page}`)
          break // Salir del bucle si no hay más anuncios
        }

        // Añadir anuncios de esta página al array total
        allAds = [...allAds, ...data.data]
        console.log(`Obtenidos ${data.data.length} anuncios de la página ${page}. Total: ${allAds.length}`)

        // Si hay menos de 20 anuncios, probablemente no hay más páginas
        if (data.data.length < 20) {
          break
        }
      } catch (error) {
        console.error(`Error al obtener la página ${page}:`, error)
        // Continuar con la siguiente página
      }

      // Pequeña pausa entre solicitudes para evitar limitaciones de rate
      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    console.log(`Total de anuncios obtenidos: ${allAds.length}`)

    // Si no se obtuvieron anuncios
    if (allAds.length === 0) {
      throw new Error("No se pudieron obtener anuncios de Binance P2P. Intenta nuevamente más tarde.")
    }

    // Extraer y procesar los anuncios
    const advertisements = allAds
      .map((ad: any) => {
        try {
          const price = Number.parseFloat(ad.adv.price)
          const available = Number.parseFloat(ad.adv.surplusAmount)
          const minLimit = Number.parseFloat(ad.adv.minSingleTransAmount)
          const maxLimit = Number.parseFloat(ad.adv.maxSingleTransAmount)
          const orderCount = ad.advertiser.monthOrderCount || 0
          const completionRate = ad.advertiser.monthFinishRate || 0

          // Determinar si el anunciante es verificado
          const isVerified = Boolean(ad.advertiser.proMerchant)

          return {
            advertiser: {
              nickName: ad.advertiser.nickName,
              userNo: ad.advertiser.userNo,
              monthOrderCount: orderCount,
              monthFinishRate: completionRate,
              positiveRate: ad.advertiser.positiveRate,
              userType: ad.advertiser.userType,
              isVerified: isVerified,
              proMerchant: Boolean(ad.advertiser.proMerchant),
            },
            price: price,
            available: available,
            limits: {
              min: minLimit,
              max: maxLimit,
              minInUSDT: minLimit / price,
              maxInUSDT: maxLimit / price,
            },
            payMethods: ad.adv.tradeMethods.map((method: any) => method.payType),
            orderCount: orderCount,
            completionRate: completionRate,
            averageTime: ad.advertiser.avgReleaseTimeOfLatest30day,
          }
        } catch (error) {
          console.error("Error al procesar anuncio:", error, ad)
          return null
        }
      })
      .filter(Boolean) // Eliminar anuncios que no se pudieron procesar

    // Eliminar duplicados (mismo userNo y mismo precio)
    const uniqueAds = advertisements.filter(
      (ad, index, self) =>
        index ===
        self.findIndex((a) => a.advertiser.userNo === ad.advertiser.userNo && Math.abs(a.price - ad.price) < 0.01),
    )

    console.log(`Anuncios después de eliminar duplicados: ${uniqueAds.length}`)

    // Verificar si hay anuncios después de procesar
    if (uniqueAds.length === 0) {
      throw new Error("No se pudieron procesar los anuncios de Binance P2P")
    }

    // Filtrar anunciantes con más de 500 órdenes
    const filteredAds = uniqueAds.filter((ad: any) => ad.orderCount >= minOrders)
    console.log(`Anuncios con más de ${minOrders} órdenes: ${filteredAds.length}`)

    // Si no hay anuncios con más de 500 órdenes, usar todos los anuncios
    let finalAds
    let usingAllAds = false

    if (filteredAds.length < 5) {
      console.warn(
        `No se encontraron suficientes anunciantes con más de ${minOrders} órdenes. Mostrando todos los anuncios.`,
      )
      finalAds = uniqueAds.sort((a: any, b: any) => b.orderCount - a.orderCount)
      usingAllAds = true
    } else {
      finalAds = filteredAds
    }

    // Calcular precios máximos y mínimos
    const prices = finalAds.map((ad: any) => ad.price)
    const maxPrice = Math.max(...prices)
    const minPrice = Math.min(...prices)

    // Contar comerciantes verificados
    const verifiedCount = finalAds.filter((ad: any) => ad.advertiser.isVerified).length

    // Crear respuesta con timestamp
    const timestamp = new Date().toISOString()
    const result = {
      timestamp,
      tradeType,
      priceStats: {
        min: minPrice.toFixed(2),
        max: maxPrice.toFixed(2),
        spread: (maxPrice - minPrice).toFixed(2),
      },
      sampleSize: finalAds.length,
      advertisements: finalAds,
      filterInfo: {
        minOrders: minOrders,
        totalCount: finalAds.length,
        verifiedCount: verifiedCount,
        usingAllAds: usingAllAds,
        totalAdsFound: uniqueAds.length,
      },
    }

    return NextResponse.json(result)
  } catch (error: any) {
    console.error("Error en la API:", error)
    return NextResponse.json({ error: "Error al procesar la solicitud", message: error.message }, { status: 500 })
  }
}
