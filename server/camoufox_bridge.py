#!/usr/bin/env python3.11
"""
Camoufox Bridge - Python script to handle browser automation tasks
This script is called from Node.js to execute Camoufox automation tasks
"""
import sys
import json
import asyncio
from camoufox.async_api import Camoufox

async def execute_task(task_data):
    """Execute a browser automation task"""
    action = task_data.get('action')
    params = task_data.get('parameters', {})
    
    try:
        async with Camoufox(
            headless=params.get('headless', True),
            humanize=params.get('humanize', False),
            os=params.get('os'),
            geoip=params.get('geoip'),
            locale=params.get('locale'),
            block_images=params.get('block_images', False),
        ) as browser:
            page = await browser.new_page()
            
            result = {}
            
            if action == 'navigate':
                url = params.get('url')
                if not url:
                    raise ValueError("URL is required for navigate action")
                await page.goto(url, wait_until=params.get('wait_until', 'load'))
                result['url'] = page.url
                result['title'] = await page.title()
                
            elif action == 'screenshot':
                url = params.get('url')
                if url:
                    await page.goto(url, wait_until=params.get('wait_until', 'load'))
                
                screenshot_path = params.get('path', '/tmp/screenshot.png')
                await page.screenshot(path=screenshot_path, full_page=params.get('full_page', False))
                result['screenshot_path'] = screenshot_path
                result['url'] = page.url
                
            elif action == 'get_content':
                url = params.get('url')
                if url:
                    await page.goto(url, wait_until=params.get('wait_until', 'load'))
                
                result['content'] = await page.content()
                result['url'] = page.url
                result['title'] = await page.title()
                
            elif action == 'click':
                url = params.get('url')
                if url:
                    await page.goto(url, wait_until=params.get('wait_until', 'load'))
                
                selector = params.get('selector')
                if not selector:
                    raise ValueError("Selector is required for click action")
                
                await page.click(selector)
                await page.wait_for_load_state(state=params.get('wait_state', 'load'))
                result['url'] = page.url
                result['title'] = await page.title()
                
            elif action == 'fill':
                url = params.get('url')
                if url:
                    await page.goto(url, wait_until=params.get('wait_until', 'load'))
                
                selector = params.get('selector')
                value = params.get('value')
                if not selector or value is None:
                    raise ValueError("Selector and value are required for fill action")
                
                await page.fill(selector, value)
                result['url'] = page.url
                
            elif action == 'evaluate':
                url = params.get('url')
                if url:
                    await page.goto(url, wait_until=params.get('wait_until', 'load'))
                
                script = params.get('script')
                if not script:
                    raise ValueError("Script is required for evaluate action")
                
                eval_result = await page.evaluate(script)
                result['result'] = eval_result
                result['url'] = page.url
                
            else:
                raise ValueError(f"Unknown action: {action}")
            
            return {
                'success': True,
                'result': result
            }
            
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }

def main():
    """Main entry point"""
    if len(sys.argv) < 2:
        print(json.dumps({'success': False, 'error': 'No task data provided'}))
        sys.exit(1)
    
    try:
        task_data = json.loads(sys.argv[1])
        result = asyncio.run(execute_task(task_data))
        print(json.dumps(result))
    except json.JSONDecodeError as e:
        print(json.dumps({'success': False, 'error': f'Invalid JSON: {str(e)}'}))
        sys.exit(1)
    except Exception as e:
        print(json.dumps({'success': False, 'error': str(e)}))
        sys.exit(1)

if __name__ == '__main__':
    main()
