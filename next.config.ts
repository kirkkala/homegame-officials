import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/ohjeita",
        destination:
          "https://drive.google.com/drive/folders/1o4IqYKMSAkkfK9V3hTNpCpl0Y1sZtLVd",
        permanent: false,
      },
    ]
  },
}

export default nextConfig
