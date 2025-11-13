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
                
            elif action == 'get_cookies':
                url = params.get('url')
                if url:
                    await page.goto(url, wait_until=params.get('wait_until', 'load'))
                cookies = await page.context.cookies()
                result['cookies'] = cookies
                
            elif action == 'set_cookies':
                cookies = params.get('cookies', [])
                await page.context.add_cookies(cookies)
                result['success'] = True
                
            elif action == 'delete_cookies':
                cookie_name = params.get('cookie_name')
                if cookie_name:
                    await page.context.clear_cookies(name=cookie_name)
                result['success'] = True
                
            elif action == 'clear_cookies':
                await page.context.clear_cookies()
                result['success'] = True
                
            elif action == 'get_storage':
                url = params.get('url')
                if url:
                    await page.goto(url, wait_until=params.get('wait_until', 'load'))
                    
                storage_type = params.get('storage_type', 'localStorage')
                storage_key = params.get('storage_key')
                
                if storage_key:
                    value = await page.evaluate(f"{storage_type}.getItem('{storage_key}')")
                    result['value'] = value
                else:
                    all_items = await page.evaluate(f"Object.keys({storage_type}).reduce((obj, key) => {{ obj[key] = {storage_type}.getItem(key); return obj; }}, {{}})")
                    result['items'] = all_items
                    
            elif action == 'set_storage':
                url = params.get('url')
                if url:
                    await page.goto(url, wait_until=params.get('wait_until', 'load'))
                    
                storage_type = params.get('storage_type', 'localStorage')
                storage_key = params.get('storage_key')
                storage_value = params.get('storage_value')
                
                if not storage_key:
                    raise ValueError("storage_key is required")
                    
                await page.evaluate(f"{storage_type}.setItem('{storage_key}', '{storage_value}')")
                result['success'] = True
                
            elif action == 'delete_storage':
                url = params.get('url')
                if url:
                    await page.goto(url, wait_until=params.get('wait_until', 'load'))
                    
                storage_type = params.get('storage_type', 'localStorage')
                storage_key = params.get('storage_key')
                
                if storage_key:
                    await page.evaluate(f"{storage_type}.removeItem('{storage_key}')")
                result['success'] = True
                
            elif action == 'clear_storage':
                url = params.get('url')
                if url:
                    await page.goto(url, wait_until=params.get('wait_until', 'load'))
                    
                storage_type = params.get('storage_type', 'localStorage')
                await page.evaluate(f"{storage_type}.clear()")
                result['success'] = True
                
            elif action == 'set_geolocation':
                latitude = params.get('latitude')
                longitude = params.get('longitude')
                accuracy = params.get('accuracy', 0)
                
                if latitude is None or longitude is None:
                    raise ValueError("latitude and longitude are required")
                    
                await page.context.set_geolocation({
                    'latitude': latitude,
                    'longitude': longitude,
                    'accuracy': accuracy
                })
                result['success'] = True
                
            elif action == 'generate_pdf':
                url = params.get('url')
                if url:
                    await page.goto(url, wait_until=params.get('wait_until', 'load'))
                    
                pdf_path = params.get('path', '/tmp/output.pdf')
                pdf_options = params.get('pdf_options', {})
                await page.pdf(path=pdf_path, **pdf_options)
                result['pdf_path'] = pdf_path
                
            elif action == 'wait_for_selector':
                url = params.get('url')
                if url:
                    await page.goto(url, wait_until=params.get('wait_until', 'load'))
                    
                selector = params.get('selector')
                if not selector:
                    raise ValueError("selector is required")
                    
                timeout = params.get('timeout', 30000)
                await page.wait_for_selector(selector, timeout=timeout)
                result['success'] = True
                
            elif action == 'wait_for_timeout':
                timeout = params.get('timeout', 1000)
                await page.wait_for_timeout(timeout)
                result['success'] = True
                
            elif action == 'press_key':
                url = params.get('url')
                if url:
                    await page.goto(url, wait_until=params.get('wait_until', 'load'))
                    
                key = params.get('key')
                if not key:
                    raise ValueError("key is required")
                    
                await page.keyboard.press(key)
                result['success'] = True
                
            elif action == 'type_text':
                url = params.get('url')
                if url:
                    await page.goto(url, wait_until=params.get('wait_until', 'load'))
                    
                value = params.get('value')
                if not value:
                    raise ValueError("value is required")
                    
                await page.keyboard.type(value)
                result['success'] = True
                
            elif action == 'mouse_click':
                url = params.get('url')
                if url:
                    await page.goto(url, wait_until=params.get('wait_until', 'load'))
                    
                x = params.get('x')
                y = params.get('y')
                button = params.get('button', 'left')
                
                if x is None or y is None:
                    raise ValueError("x and y coordinates are required")
                    
                await page.mouse.click(x, y, button=button)
                result['success'] = True
                
            elif action == 'mouse_move':
                url = params.get('url')
                if url:
                    await page.goto(url, wait_until=params.get('wait_until', 'load'))
                    
                x = params.get('x')
                y = params.get('y')
                
                if x is None or y is None:
                    raise ValueError("x and y coordinates are required")
                    
                await page.mouse.move(x, y)
                result['success'] = True
                
            elif action == 'drag_and_drop':
                url = params.get('url')
                if url:
                    await page.goto(url, wait_until=params.get('wait_until', 'load'))
                    
                source = params.get('source_selector')
                target = params.get('target_selector')
                
                if not source or not target:
                    raise ValueError("source_selector and target_selector are required")
                    
                await page.drag_and_drop(source, target)
                result['success'] = True
                
            elif action == 'upload_file':
                url = params.get('url')
                if url:
                    await page.goto(url, wait_until=params.get('wait_until', 'load'))
                    
                selector = params.get('selector')
                file_path = params.get('file_path')
                
                if not selector or not file_path:
                    raise ValueError("selector and file_path are required")
                    
                await page.set_input_files(selector, file_path)
                result['success'] = True
                
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
