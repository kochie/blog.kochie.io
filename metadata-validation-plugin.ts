import { NextConfig } from 'next'
import path from 'path'
import fs from 'fs'

interface FileLoggerOptions {
  outputPath?: string
}

function withFileLogger(
  nextConfig: NextConfig = {}, 
  pluginOptions: FileLoggerOptions = {}
): NextConfig {
  return {
    ...nextConfig,
    async generateBuildId() {
      // This hook runs during the build process
      const buildId = Math.random().toString(36).substring(2, 9)
      return buildId
    },
    async afterBuild({ dir, buildId }) {
      // Path to the .next directory
      const nextDir = path.join(dir, '.next')
      
      // Path to the server output directory
      const serverDir = path.join(nextDir, 'server', 'pages')
      
      try {
        // Read all files in the server directory
        const files = await fs.promises.readdir(serverDir)
        
        // Filter for HTML files
        const htmlFiles = files.filter(file => 
          file.endsWith('.html') || 
          file.endsWith('.json')
        )
        
        // Log the HTML files
        console.log('Generated HTML Files:')
        htmlFiles.forEach(file => {
          console.log(`- ${file}`)
        })
        
        // Optional: Write to a log file
        const logPath = path.join(dir, 'generated-files.log')
        await fs.promises.writeFile(
          logPath, 
          htmlFiles.join('\n'), 
          'utf-8'
        )
      } catch (error) {
        console.error('Error reading generated files:', error)
      }
    }
  }
}

export default withFileLogger